import { describe, expect, it } from "vitest";
import { parseIntent } from "@/lib/intent-parser";

describe("intent parser (README: deterministic commands)", () => {
  it('parses "Pay my internet bill if it\'s under $120"', () => {
    const p = parseIntent("Pay my internet bill if it's under $120");
    expect(p.kind).toBe("pay_bill_under");
    expect(p.threshold).toBe(120);
    expect(p.billKeyword).toBe("internet");
  });

  it("parses savings transfer", () => {
    const p = parseIntent("Move $100 to savings on payday");
    expect(p.kind).toBe("savings_transfer");
    expect(p.amount).toBe(100);
  });

  it("parses list approvals", () => {
    const p = parseIntent("Show anything waiting for approval");
    expect(p.kind).toBe("list_approvals");
  });

  it("parses external transfer to new account", () => {
    const p = parseIntent("Transfer $1,200 to a new external account");
    expect(p.kind).toBe("external_transfer");
    expect(p.amount).toBe(1200);
  });

  it("parses electricity / threshold scenario (Flow D)", () => {
    const p = parseIntent("Electricity bill $142 recurring");
    expect(p.kind).toBe("pay_bill_under");
    expect(p.billKeyword).toBe("electric");
    expect(p.threshold).toBe(100);
  });
});
