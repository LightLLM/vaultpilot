import type { ProviderId, UserPolicy } from "@/lib/types";

export interface PolicyContext {
  amount: number;
  isFirstTimePayee: boolean;
  isNewExternalAccount: boolean;
  isSavingsTransfer: boolean;
  isNight: boolean;
  dailySpendCommitted: number;
}

export interface PolicyResult {
  allowed: boolean;
  needsApproval: boolean;
  matchedRules: string[];
  denialReason?: string;
  approvalReason?: string;
}

export function evaluatePolicy(
  policy: UserPolicy,
  provider: ProviderId,
  ctx: PolicyContext,
): PolicyResult {
  const matchedRules: string[] = [];

  if (ctx.isNewExternalAccount && policy.requireApprovalNewExternalAccounts) {
    matchedRules.push("require_approval_new_external_accounts");
    return {
      allowed: true,
      needsApproval: true,
      matchedRules,
      approvalReason:
        "New external accounts require explicit approval per your policy.",
    };
  }

  if (ctx.isFirstTimePayee && policy.requireApprovalFirstTimePayee) {
    matchedRules.push("require_approval_first_time_payee");
    return {
      allowed: true,
      needsApproval: true,
      matchedRules,
      approvalReason: "First-time payees require approval.",
    };
  }

  if (ctx.isSavingsTransfer && !policy.allowSavingsTransfers) {
    matchedRules.push("savings_transfers_disabled");
    return {
      allowed: false,
      needsApproval: false,
      matchedRules,
      denialReason: "Savings transfers are disabled in your policy.",
    };
  }

  if (
    ctx.dailySpendCommitted + ctx.amount > policy.maxDailyAutomatedSpend &&
    !ctx.isSavingsTransfer
  ) {
    matchedRules.push("max_daily_automated_spend");
    return {
      allowed: false,
      needsApproval: true,
      matchedRules,
      approvalReason:
        "This would exceed your maximum daily automated spend without approval.",
    };
  }

  if (ctx.isNight && policy.blockActionsAtNight) {
    matchedRules.push("block_actions_at_night");
    return {
      allowed: true,
      needsApproval: true,
      matchedRules,
      approvalReason: "Night-time window requires approval for automated actions.",
    };
  }

  if (ctx.amount > policy.autoPayThreshold && provider === "mock_billing") {
    matchedRules.push("above_autopay_threshold");
    return {
      allowed: true,
      needsApproval: true,
      matchedRules,
      approvalReason: `Bill amount exceeds auto-pay limit ($${policy.autoPayThreshold}).`,
    };
  }

  if (ctx.amount > policy.approvalThreshold) {
    matchedRules.push("above_approval_threshold");
    return {
      allowed: true,
      needsApproval: true,
      matchedRules,
      approvalReason: `Amount exceeds approval threshold ($${policy.approvalThreshold}).`,
    };
  }

  matchedRules.push("within_automated_bounds");
  return {
    allowed: true,
    needsApproval: false,
    matchedRules,
  };
}

/** Demo helper: treat hour 22–6 as “night” when blockActionsAtNight is on */
export function isNightHour(date: Date): boolean {
  const h = date.getHours();
  return h >= 22 || h < 6;
}
