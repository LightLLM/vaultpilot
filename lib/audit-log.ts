import type {
  ApprovalStatus,
  AuditEntry,
  ExecutionStatus,
  ProviderId,
  RiskLevel,
} from "@/lib/types";
import { appendAuditEntry } from "@/lib/demo-store";

export function logAudit(entry: Omit<AuditEntry, "id" | "timestamp">): AuditEntry {
  const full: AuditEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  appendAuditEntry(full);
  return full;
}

export function logPolicyAudit(
  user: string,
  actionType: string,
  provider: ProviderId | "system",
  matchedRules: string[],
  extras?: Partial<
    Pick<
      AuditEntry,
      "amount" | "payee" | "riskLevel" | "approvalStatus" | "executionStatus" | "notes"
    >
  >,
) {
  return logAudit({
    user,
    actionType,
    provider,
    riskLevel: extras?.riskLevel ?? "LOW",
    matchedPolicyRules: matchedRules,
    approvalStatus: extras?.approvalStatus ?? "not_required",
    executionStatus: extras?.executionStatus ?? "success",
    amount: extras?.amount,
    payee: extras?.payee,
    notes: extras?.notes,
  });
}

export type { AuditEntry, ApprovalStatus, ExecutionStatus, RiskLevel };
