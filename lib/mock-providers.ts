/**
 * Mock provider adapters — sandbox only. No real bank APIs.
 * In production, these would call institution APIs using short-lived tokens
 * obtained via Auth0 Token Vault (see lib/token-vault.ts).
 */

import {
  addDailySpend,
  getBills,
  recordSavingsMovement,
} from "@/lib/demo-store";
import type { Bill } from "@/lib/types";
import { isProviderConnected } from "@/lib/token-vault";

export interface MockPaymentResult {
  success: boolean;
  confirmationId: string;
  payee: string;
  amount: number;
  message: string;
}

export interface MockTransferResult {
  success: boolean;
  confirmationId: string;
  amount: number;
  destination: string;
  message: string;
}

export const mockBank = {
  readBalances(): { checking: number; savings: number } {
    return { checking: 8420.55, savings: 12100 };
  },
  readTransactions(limit = 5): { id: string; memo: string; amount: number }[] {
    return Array.from({ length: limit }, (_, i) => ({
      id: `tx-${i}`,
      memo: i % 2 ? "Card purchase" : "ACH transfer",
      amount: -(42 + i * 11),
    }));
  },
  createTransfer(amount: number, destination: string): MockTransferResult {
    return {
      success: true,
      confirmationId: `TR-${crypto.randomUUID().slice(0, 8)}`,
      amount,
      destination,
      message: `Sandbox transfer recorded to ${destination}.`,
    };
  },
};

export const mockBilling = {
  listUpcomingBills(): Bill[] {
    return getBills();
  },
  createPaymentIntent(payee: string, amount: number) {
    return {
      intentId: `PI-${crypto.randomUUID().slice(0, 8)}`,
      payee,
      amount,
      status: "ready" as const,
    };
  },
  executePayment(payee: string, amount: number): MockPaymentResult {
    addDailySpend(amount);
    return {
      success: true,
      confirmationId: `PAY-${crypto.randomUUID().slice(0, 8)}`,
      payee,
      amount,
      message: `Sandbox payment to ${payee} simulated successfully.`,
    };
  },
};

export const mockSavings = {
  moveToSavings(amount: number, label: string) {
    recordSavingsMovement(amount, label);
    return {
      success: true,
      confirmationId: `SAV-${crypto.randomUUID().slice(0, 8)}`,
      amount,
      message: `Sandbox move of $${amount} to savings (${label}).`,
    };
  },
  getHistory() {
    return { entries: [] as { amount: number; at: string }[] };
  },
};

export function requireConnected(
  provider: Parameters<typeof isProviderConnected>[0],
  label: string,
) {
  if (!isProviderConnected(provider)) {
    throw new Error(`${label} requires a connected provider.`);
  }
}
