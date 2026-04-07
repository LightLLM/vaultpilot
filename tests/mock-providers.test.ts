import { describe, expect, it } from "vitest";
import { mockBank, mockBilling, mockSavings } from "@/lib/mock-providers";
import { getDailySpend, getSavingsHistory } from "@/lib/demo-store";

describe("mock providers (README: sandbox bank / billing / savings)", () => {
  it("mock bank exposes readBalances and createTransfer", () => {
    const b = mockBank.readBalances();
    expect(b.checking).toBeGreaterThan(0);
    const t = mockBank.createTransfer(50, "Test");
    expect(t.success).toBe(true);
    expect(t.confirmationId).toMatch(/^TR-/);
  });

  it("mock billing lists seed bills including MetroNet and PowerGrid", () => {
    const bills = mockBilling.listUpcomingBills();
    const payees = bills.map((b) => b.payee);
    expect(payees).toContain("MetroNet");
    expect(payees).toContain("PowerGrid");
  });

  it("executePayment increments daily spend via demo store", () => {
    const before = getDailySpend();
    mockBilling.executePayment("MetroNet", 10);
    expect(getDailySpend()).toBe(before + 10);
  });

  it("mock savings records movement in history", () => {
    const beforeLen = getSavingsHistory().length;
    mockSavings.moveToSavings(25, "unit test");
    expect(getSavingsHistory().length).toBeGreaterThanOrEqual(beforeLen + 1);
    expect(getSavingsHistory()[0].amount).toBe(25);
  });
});
