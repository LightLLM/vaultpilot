import type {
  RecommendedAction,
  RiskLevel,
  UserPolicy,
} from "@/lib/types";

export interface RiskContext {
  amount: number;
  isRecurringPayee: boolean;
  isNewPayee: boolean;
  isNewExternalAccount: boolean;
  belowAutoPayThreshold: boolean;
  isNightBlocked: boolean;
  exceedsDailyLimit: boolean;
  policyRequiresApproval: boolean;
}

export interface RiskResult {
  level: RiskLevel;
  reasons: string[];
  recommendedAction: RecommendedAction;
}

export function assessRisk(
  policy: UserPolicy,
  ctx: RiskContext,
): RiskResult {
  const reasons: string[] = [];

  if (ctx.isNewExternalAccount) {
    reasons.push("Transfer to a new external account requires verification.");
    return {
      level: "HIGH",
      reasons,
      recommendedAction: "require_approval",
    };
  }

  if (ctx.policyRequiresApproval) {
    reasons.push("Policy explicitly requires approval for this action.");
    return {
      level: "HIGH",
      reasons,
      recommendedAction: "require_approval",
    };
  }

  if (ctx.isNewPayee && ctx.amount > policy.approvalThreshold) {
    reasons.push("New payee and amount exceeds approval threshold.");
    return {
      level: "HIGH",
      reasons,
      recommendedAction: "require_approval",
    };
  }

  if (ctx.exceedsDailyLimit) {
    reasons.push("Would exceed maximum daily automated spend.");
    return {
      level: "HIGH",
      reasons,
      recommendedAction: "block",
    };
  }

  if (ctx.isNightBlocked) {
    reasons.push("Automated actions are blocked during night hours.");
    return {
      level: "MEDIUM",
      reasons,
      recommendedAction: "require_approval",
    };
  }

  if (ctx.isRecurringPayee && ctx.belowAutoPayThreshold) {
    reasons.push("Recurring payee within auto-pay threshold.");
    return {
      level: "LOW",
      reasons,
      recommendedAction: "auto_execute",
    };
  }

  if (ctx.isRecurringPayee && !ctx.belowAutoPayThreshold) {
    reasons.push("Recurring payee but amount exceeds auto-pay threshold.");
    return {
      level: "MEDIUM",
      reasons,
      recommendedAction: "require_approval",
    };
  }

  if (!ctx.isRecurringPayee && ctx.amount <= policy.approvalThreshold) {
    reasons.push("One-time payee within approval threshold — review suggested.");
    return {
      level: "MEDIUM",
      reasons,
      recommendedAction: "require_approval",
    };
  }

  reasons.push("Elevated risk based on payee and amount.");
  return {
    level: "HIGH",
    reasons,
    recommendedAction: "require_approval",
  };
}
