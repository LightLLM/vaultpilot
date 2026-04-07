import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { approvePending, rejectPending, runAgentCommand } from "@/lib/agent";
import { getApprovals, getAuditLog, getDailySpend } from "@/lib/demo-store";

/** README demo flows — daytime so blockActionsAtNight does not force approval */
function setDaytime() {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2024, 5, 15, 14, 0, 0));
}

describe("README demo flows (agent + policy + risk)", () => {
  beforeEach(() => {
    setDaytime();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("Flow A: safe recurring bill auto-pay (MetroNet $89 under $120)", () => {
    const r = runAgentCommand("Pay my internet bill if it's under $120");
    expect(r.execution?.status).toBe("success");
    expect(r.parsedIntent).toMatch(/MetroNet|internet|under/i);
    expect(r.risk.level).toBe("LOW");
    const audit = getAuditLog();
    expect(audit.some((a) => a.actionType === "bill_pay_executed")).toBe(true);
    expect(getDailySpend()).toBeGreaterThanOrEqual(89);
  });

  it("Flow B: move $100 to savings when savings transfers enabled", () => {
    const r = runAgentCommand("Move $100 to savings on payday");
    expect(r.execution?.status).toBe("success");
    expect(r.parsedIntent).toMatch(/savings/i);
    expect(getAuditLog().some((a) => a.actionType === "savings_transfer")).toBe(
      true,
    );
  });

  it("Flow C: high-risk external transfer queues approval; approve executes", () => {
    const r = runAgentCommand("Transfer $1,200 to a new external account");
    expect(r.execution?.status).toBe("pending");
    expect(r.risk.level).toBe("HIGH");
    const pending = getApprovals();
    expect(pending.length).toBeGreaterThanOrEqual(1);
    const id = pending[0].id;
    const out = approvePending(id);
    expect(out.ok).toBe(true);
    expect(
      getAuditLog().some((a) => a.actionType === "external_transfer_executed"),
    ).toBe(true);
  });

  it("Flow D: electricity $142 vs $100 auto-pay cap requires approval", () => {
    const r = runAgentCommand("Electricity bill $142 recurring");
    expect(r.execution?.status).toBe("pending");
    expect(r.policyDecision.needsApproval).toBe(true);
    expect(r.policyDecision.approvalReason).toMatch(/auto-pay|100|threshold/i);
    const titles = getApprovals().map((a) => a.title);
    expect(titles.some((t) => /142|PowerGrid|Utilities/i.test(t))).toBe(true);
  });

  it("rejectPending logs rejection in audit", () => {
    const r = runAgentCommand("Transfer $1,200 to a new external account");
    expect(r.execution?.status).toBe("pending");
    const id = getApprovals()[0].id;
    const out = rejectPending(id);
    expect(out.ok).toBe(true);
    expect(
      getAuditLog().some(
        (a) =>
          a.actionType === "approval_rejected" && a.approvalStatus === "rejected",
      ),
    ).toBe(true);
  });

  it("list approvals command returns count and logs read-only audit", () => {
    const r = runAgentCommand("Show anything waiting for approval");
    expect(r.execution?.status).toBe("success");
    expect(r.parsedIntent).toMatch(/approval/i);
    expect(
      getAuditLog().some((a) => a.actionType === "agent_query_approvals"),
    ).toBe(true);
  });
});
