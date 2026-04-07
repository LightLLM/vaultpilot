import { DEFAULT_POLICY, SEED_BILLS } from "@/data/mock-data";
import type {
  AuditEntry,
  Bill,
  PendingApproval,
  ProviderConnection,
  ProviderId,
  UserPolicy,
} from "@/lib/types";

interface SavingsMovement {
  id: string;
  amount: number;
  at: string;
  label: string;
}

const allProviders: ProviderId[] = ["mock_bank", "mock_billing", "mock_savings"];

function initialConnections(): Record<ProviderId, ProviderConnection> {
  const now = new Date().toISOString();
  return {
    mock_bank: {
      provider: "mock_bank",
      connected: true,
      scopes: ["balances.read", "transactions.read", "transfers.write"],
      lastConsentAt: now,
    },
    mock_billing: {
      provider: "mock_billing",
      connected: true,
      scopes: ["bills.read", "payments.write"],
      lastConsentAt: now,
    },
    mock_savings: {
      provider: "mock_savings",
      connected: true,
      scopes: ["savings.write", "savings.history"],
      lastConsentAt: now,
    },
  };
}

let policy: UserPolicy = { ...DEFAULT_POLICY };
const bills: Bill[] = SEED_BILLS.map((b) => ({ ...b }));
let dailyAutomatedSpend = 0;
const approvals: PendingApproval[] = [];
const auditLog: AuditEntry[] = [];
const connections = initialConnections();
const savingsHistory: SavingsMovement[] = [
  {
    id: "sv-1",
    amount: 250,
    at: new Date(Date.now() - 86400000 * 5).toISOString(),
    label: "Payday sweep",
  },
];

function seedInitialAudit() {
  if (auditLog.length > 0) return;
  appendAuditEntry({
    id: crypto.randomUUID(),
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    user: "demo@vaultpilot.local",
    actionType: "policy_review",
    provider: "system",
    riskLevel: "LOW",
    matchedPolicyRules: ["within_automated_bounds"],
    approvalStatus: "not_required",
    executionStatus: "success",
    notes: "Sandbox policy check — no funds moved.",
  });
}

seedInitialAudit();

export function getPolicy(): UserPolicy {
  return { ...policy };
}

export function setPolicy(next: UserPolicy) {
  policy = { ...next };
}

export function getBills(): Bill[] {
  return bills.map((b) => ({ ...b }));
}

export function getDailySpend(): number {
  return dailyAutomatedSpend;
}

export function addDailySpend(amount: number) {
  dailyAutomatedSpend += amount;
}

export function getApprovals(): PendingApproval[] {
  return approvals.map((a) => ({ ...a }));
}

export function addApproval(
  entry: Omit<PendingApproval, "id" | "createdAt">,
): PendingApproval {
  const full: PendingApproval = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  approvals.unshift(full);
  return full;
}

export function removeApproval(id: string): PendingApproval | undefined {
  const idx = approvals.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  const [removed] = approvals.splice(idx, 1);
  return removed;
}

export function getAuditLog(): AuditEntry[] {
  return [...auditLog].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function appendAuditEntry(entry: AuditEntry) {
  auditLog.unshift(entry);
}

export function getConnections(): Record<ProviderId, ProviderConnection> {
  return { ...connections };
}

export function updateConnection(
  provider: ProviderId,
  patch: Partial<ProviderConnection>,
) {
  connections[provider] = { ...connections[provider], ...patch };
}

export function disconnectProvider(provider: ProviderId) {
  connections[provider] = {
    ...connections[provider],
    connected: false,
    scopes: [],
    lastConsentAt: connections[provider].lastConsentAt,
  };
}

export function connectProvider(provider: ProviderId) {
  connections[provider] = {
    provider,
    connected: true,
    scopes:
      provider === "mock_bank"
        ? ["balances.read", "transactions.read", "transfers.write"]
        : provider === "mock_billing"
          ? ["bills.read", "payments.write"]
          : ["savings.write", "savings.history"],
    lastConsentAt: new Date().toISOString(),
  };
}

export function getSavingsHistory(): SavingsMovement[] {
  return [...savingsHistory];
}

export function recordSavingsMovement(amount: number, label: string) {
  savingsHistory.unshift({
    id: crypto.randomUUID(),
    amount,
    at: new Date().toISOString(),
    label,
  });
}

export function listProviderIds(): ProviderId[] {
  return [...allProviders];
}

/**
 * Reset all in-memory demo state (policy, bills, spend, approvals, audit,
 * connections, savings). Used by tests and local tooling — not for production.
 */
export function resetDemoStore() {
  policy = { ...DEFAULT_POLICY };
  bills.length = 0;
  bills.push(...SEED_BILLS.map((b) => ({ ...b })));
  dailyAutomatedSpend = 0;
  approvals.length = 0;
  auditLog.length = 0;
  const fresh = initialConnections();
  for (const id of allProviders) {
    connections[id] = fresh[id];
  }
  savingsHistory.length = 0;
  savingsHistory.push({
    id: "sv-1",
    amount: 250,
    at: new Date(Date.now() - 86400000 * 5).toISOString(),
    label: "Payday sweep",
  });
  seedInitialAudit();
}
