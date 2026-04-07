import { describe, expect, it } from "vitest";
import { DEFAULT_POLICY } from "@/data/mock-data";
import { assessRisk } from "@/lib/risk-engine";

describe("risk engine (README: LOW/MEDIUM/HIGH + recommended action)", () => {
  const policy = DEFAULT_POLICY;

  it("returns LOW + auto_execute for recurring payee under auto-pay threshold", () => {
    const r = assessRisk(policy, {
      amount: 89,
      isRecurringPayee: true,
      isNewPayee: false,
      isNewExternalAccount: false,
      belowAutoPayThreshold: true,
      isNightBlocked: false,
      exceedsDailyLimit: false,
      policyRequiresApproval: false,
    });
    expect(r.level).toBe("LOW");
    expect(r.recommendedAction).toBe("auto_execute");
  });

  it("returns MEDIUM when recurring but above auto-pay threshold", () => {
    const r = assessRisk(policy, {
      amount: 142,
      isRecurringPayee: true,
      isNewPayee: false,
      isNewExternalAccount: false,
      belowAutoPayThreshold: false,
      isNightBlocked: false,
      exceedsDailyLimit: false,
      policyRequiresApproval: false,
    });
    expect(r.level).toBe("MEDIUM");
    expect(r.recommendedAction).toBe("require_approval");
  });

  it("returns HIGH for new external account", () => {
    const r = assessRisk(policy, {
      amount: 1200,
      isRecurringPayee: false,
      isNewPayee: true,
      isNewExternalAccount: true,
      belowAutoPayThreshold: false,
      isNightBlocked: false,
      exceedsDailyLimit: false,
      policyRequiresApproval: false,
    });
    expect(r.level).toBe("HIGH");
    expect(r.recommendedAction).toBe("require_approval");
  });

  it("returns HIGH + block when daily automated spend would be exceeded", () => {
    const r = assessRisk(policy, {
      amount: 300,
      isRecurringPayee: true,
      isNewPayee: false,
      isNewExternalAccount: false,
      belowAutoPayThreshold: false,
      isNightBlocked: false,
      exceedsDailyLimit: true,
      policyRequiresApproval: false,
    });
    expect(r.level).toBe("HIGH");
    expect(r.recommendedAction).toBe("block");
  });
});
