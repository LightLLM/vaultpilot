import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as postAgent } from "@/app/api/agent/route";
import { POST as postApprovals } from "@/app/api/approvals/route";
import { GET as getBills } from "@/app/api/mock/bills/route";
import { POST as postPayments } from "@/app/api/mock/payments/route";
import { POST as postPolicy } from "@/app/api/policy/route";
import { POST as postProviders } from "@/app/api/providers/route";
import { GET as getState } from "@/app/api/state/route";
import { POST as postTransfers } from "@/app/api/mock/transfers/route";
import { DEFAULT_POLICY } from "@/data/mock-data";

function postJson(path: string, body: unknown) {
  return new NextRequest(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("API route handlers (README endpoints)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 5, 15, 14, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("GET /api/state returns policy, approvals, audit, bills, connections, dailySpend", async () => {
    const res = await getState();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.policy).toMatchObject({
      autoPayThreshold: DEFAULT_POLICY.autoPayThreshold,
    });
    expect(Array.isArray(json.approvals)).toBe(true);
    expect(Array.isArray(json.audit)).toBe(true);
    expect(Array.isArray(json.bills)).toBe(true);
    expect(json.connections).toBeDefined();
    expect(typeof json.dailySpend).toBe("number");
  });

  it("POST /api/agent runs command and returns structured agent result", async () => {
    const req = postJson("/api/agent", {
      command: "Pay my internet bill if it's under $120",
    });
    const res = await postAgent(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("parsedIntent");
    expect(json).toHaveProperty("policyDecision");
    expect(json).toHaveProperty("risk");
    expect(json).toHaveProperty("execution");
    expect(json.execution?.status).toBe("success");
  });

  it("POST /api/agent returns 400 when command missing", async () => {
    const req = postJson("/api/agent", {});
    const res = await postAgent(req);
    expect(res.status).toBe(400);
  });

  it("POST /api/policy persists policy", async () => {
    const next = { ...DEFAULT_POLICY, autoPayThreshold: 95 };
    const req = postJson("/api/policy", next);
    const res = await postPolicy(req);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.policy.autoPayThreshold).toBe(95);
  });

  it("POST /api/approvals approve/reject", async () => {
    const agentReq = postJson("/api/agent", {
      command: "Transfer $1,200 to a new external account",
    });
    await postAgent(agentReq);
    const state = await (await getState()).json();
    const id = state.approvals[0].id;
    const approveReq = postJson("/api/approvals", { id, action: "approve" });
    const res = await postApprovals(approveReq);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it("POST /api/providers connect/revoke", async () => {
    const revokeReq = postJson("/api/providers", {
      provider: "mock_savings",
      action: "revoke",
    });
    await postProviders(revokeReq);
    let state = await (await getState()).json();
    expect(state.connections.mock_savings.connected).toBe(false);
    const connectReq = postJson("/api/providers", {
      provider: "mock_savings",
      action: "connect",
    });
    await postProviders(connectReq);
    state = await (await getState()).json();
    expect(state.connections.mock_savings.connected).toBe(true);
  });

  it("GET /api/mock/bills lists bills", async () => {
    const res = await getBills();
    const json = await res.json();
    expect(json.bills.length).toBeGreaterThan(0);
  });

  it("POST /api/mock/payments and transfers return sandbox confirmations", async () => {
    const pay = await postPayments(
      postJson("/api/mock/payments", { payee: "Test", amount: 1 }),
    );
    const payJson = await pay.json();
    expect(payJson.success).toBe(true);
    const tx = await postTransfers(
      postJson("/api/mock/transfers", { amount: 10, destination: "X" }),
    );
    const txJson = await tx.json();
    expect(txJson.success).toBe(true);
  });
});
