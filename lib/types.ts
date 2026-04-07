export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type RecommendedAction = "auto_execute" | "require_approval" | "block";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "not_required";

export type ExecutionStatus = "success" | "pending" | "failed" | "skipped";

export type ProviderId = "mock_bank" | "mock_billing" | "mock_savings";

export interface UserPolicy {
  autoPayThreshold: number;
  requireApprovalFirstTimePayee: boolean;
  maxDailyAutomatedSpend: number;
  allowSavingsTransfers: boolean;
  approvalThreshold: number;
  blockActionsAtNight: boolean;
  requireApprovalNewExternalAccounts: boolean;
}

export interface Bill {
  id: string;
  payee: string;
  amount: number;
  recurring: boolean;
  category: string;
  dueInDays: number;
}

export interface PendingApproval {
  id: string;
  title: string;
  amount: number;
  payee?: string;
  provider: ProviderId;
  riskLevel: RiskLevel;
  reason: string;
  createdAt: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  actionType: string;
  provider: ProviderId | "system";
  amount?: number;
  payee?: string;
  riskLevel: RiskLevel;
  matchedPolicyRules: string[];
  approvalStatus: ApprovalStatus;
  executionStatus: ExecutionStatus;
  notes?: string;
}

export interface ProviderConnection {
  provider: ProviderId;
  connected: boolean;
  scopes: string[];
  lastConsentAt: string | null;
}

export interface AgentCommandResult {
  parsedIntent: string;
  actionPlan: string[];
  policyDecision: {
    allowed: boolean;
    needsApproval: boolean;
    matchedRules: string[];
    denialReason?: string;
    approvalReason?: string;
  };
  risk: {
    level: RiskLevel;
    reasons: string[];
    recommendedAction: RecommendedAction;
  };
  execution?: {
    status: ExecutionStatus;
    message: string;
    approvalId?: string;
  };
}

export interface ParsedIntent {
  kind:
    | "pay_bill_under"
    | "savings_transfer"
    | "list_approvals"
    | "external_transfer"
    | "pause_subscriptions"
    | "unknown";
  threshold?: number;
  amount?: number;
  /** Hint for demo parsers (e.g. electricity scenario) */
  billKeyword?: string;
  raw: string;
}
