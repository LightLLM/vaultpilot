import type { Bill, PendingApproval, UserPolicy } from "@/lib/types";

export const DEFAULT_POLICY: UserPolicy = {
  autoPayThreshold: 100,
  requireApprovalFirstTimePayee: true,
  maxDailyAutomatedSpend: 250,
  allowSavingsTransfers: true,
  approvalThreshold: 200,
  blockActionsAtNight: true,
  requireApprovalNewExternalAccounts: true,
};

export const SEED_BILLS: Bill[] = [
  {
    id: "bill-internet",
    payee: "MetroNet",
    amount: 89,
    recurring: true,
    category: "Internet",
    dueInDays: 3,
  },
  {
    id: "bill-electric",
    payee: "PowerGrid",
    amount: 142,
    recurring: true,
    category: "Utilities",
    dueInDays: 5,
  },
  {
    id: "bill-streaming",
    payee: "StreamBox",
    amount: 19,
    recurring: true,
    category: "Entertainment",
    dueInDays: 12,
  },
];

/** Sample pending approval for demo — cleared when user processes flows */
export const SAMPLE_EXTERNAL_APPROVAL: Omit<PendingApproval, "id" | "createdAt"> = {
  title: "Transfer $1,200 to New External Account",
  amount: 1200,
  provider: "mock_bank",
  riskLevel: "HIGH",
  reason: "New external account and amount exceeds your approval threshold.",
  metadata: { destination: "New External Account" },
};
