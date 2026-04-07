import { describe, expect, it } from "vitest";
import { DEFAULT_POLICY } from "@/data/mock-data";
import { evaluatePolicy, isNightHour } from "@/lib/policy-engine";

describe("policy engine (README: user-defined caps, thresholds, night blocks)", () => {
  const policy = DEFAULT_POLICY;

  it("flags bills above auto-pay threshold for mock billing", () => {
    const r = evaluatePolicy(policy, "mock_billing", {
      amount: 142,
      isFirstTimePayee: false,
      isNewExternalAccount: false,
      isSavingsTransfer: false,
      isNight: false,
      dailySpendCommitted: 0,
    });
    expect(r.needsApproval).toBe(true);
    expect(r.matchedRules).toContain("above_autopay_threshold");
    expect(r.approvalReason).toContain("100");
  });

  it("allows recurring bill under auto-pay threshold within bounds", () => {
    const r = evaluatePolicy(policy, "mock_billing", {
      amount: 89,
      isFirstTimePayee: false,
      isNewExternalAccount: false,
      isSavingsTransfer: false,
      isNight: false,
      dailySpendCommitted: 0,
    });
    expect(r.allowed).toBe(true);
    expect(r.needsApproval).toBe(false);
    expect(r.matchedRules).toContain("within_automated_bounds");
  });

  it("denies savings transfers when disabled", () => {
    const p = { ...policy, allowSavingsTransfers: false };
    const r = evaluatePolicy(p, "mock_savings", {
      amount: 100,
      isFirstTimePayee: false,
      isNewExternalAccount: false,
      isSavingsTransfer: true,
      isNight: false,
      dailySpendCommitted: 0,
    });
    expect(r.allowed).toBe(false);
    expect(r.denialReason).toMatch(/savings transfers are disabled/i);
  });

  it("requires approval for new external accounts when policy mandates", () => {
    const r = evaluatePolicy(policy, "mock_bank", {
      amount: 1200,
      isFirstTimePayee: false,
      isNewExternalAccount: true,
      isSavingsTransfer: false,
      isNight: false,
      dailySpendCommitted: 0,
    });
    expect(r.needsApproval).toBe(true);
    expect(r.matchedRules).toContain("require_approval_new_external_accounts");
  });

  it("requires approval during night window when blockActionsAtNight is on", () => {
    const r = evaluatePolicy(policy, "mock_billing", {
      amount: 50,
      isFirstTimePayee: false,
      isNewExternalAccount: false,
      isSavingsTransfer: false,
      isNight: true,
      dailySpendCommitted: 0,
    });
    expect(r.needsApproval).toBe(true);
    expect(r.matchedRules).toContain("block_actions_at_night");
  });

  it("isNightHour uses local hours 22–6 (README: night block)", () => {
    expect(isNightHour(new Date(2024, 0, 1, 5, 30))).toBe(true);
    expect(isNightHour(new Date(2024, 0, 1, 22, 30))).toBe(true);
    expect(isNightHour(new Date(2024, 0, 1, 12, 0))).toBe(false);
    expect(isNightHour(new Date(2024, 0, 1, 21, 59))).toBe(false);
  });
});
