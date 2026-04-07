import { describe, expect, it } from "vitest";
import { logAudit } from "@/lib/audit-log";
import { getAuditLog } from "@/lib/demo-store";

describe("audit logger (README: structured audit trail)", () => {
  it("appends entries with id, timestamp, and policy fields", () => {
    const before = getAuditLog().length;
    const entry = logAudit({
      user: "test@example.com",
      actionType: "unit_test",
      provider: "system",
      riskLevel: "LOW",
      matchedPolicyRules: ["test_rule"],
      approvalStatus: "not_required",
      executionStatus: "success",
      notes: "test",
    });
    expect(entry.id).toBeDefined();
    expect(entry.timestamp).toBeDefined();
    expect(getAuditLog().length).toBeGreaterThanOrEqual(before + 1);
    const top = getAuditLog()[0];
    expect(top.actionType).toBe("unit_test");
    expect(top.matchedPolicyRules).toContain("test_rule");
  });
});
