import { logAudit } from "@/lib/audit-log";
import {
  addApproval,
  getApprovals,
  getBills,
  getDailySpend,
  getPolicy,
  removeApproval,
} from "@/lib/demo-store";
import { parseIntent } from "@/lib/intent-parser";
import { mockBilling, mockBank, mockSavings } from "@/lib/mock-providers";
import { evaluatePolicy, isNightHour } from "@/lib/policy-engine";
import { assessRisk } from "@/lib/risk-engine";
import type { AgentCommandResult } from "@/lib/types";
import { getDelegatedAccess } from "@/lib/token-vault";
import { getCurrentUser } from "@/lib/auth";

function billForKeyword(keyword?: string) {
  const bills = getBills();
  if (!keyword) return bills.find((b) => /internet|metronet/i.test(b.payee));
  if (/electric|power/i.test(keyword))
    return bills.find((b) => /powergrid/i.test(b.payee));
  if (/internet|metro/i.test(keyword))
    return bills.find((b) => /metronet/i.test(b.payee));
  return bills[0];
}

export function runAgentCommand(command: string): AgentCommandResult {
  const user = getCurrentUser();
  const policy = getPolicy();
  const intent = parseIntent(command);
  const accessBilling = getDelegatedAccess("mock_billing");
  const accessBank = getDelegatedAccess("mock_bank");
  const accessSavings = getDelegatedAccess("mock_savings");

  if (intent.kind === "list_approvals") {
    const pending = getApprovals();
    logAudit({
      user: user.email,
      actionType: "agent_query_approvals",
      provider: "system",
      riskLevel: "LOW",
      matchedPolicyRules: ["read_only"],
      approvalStatus: "not_required",
      executionStatus: "success",
      notes: `Pending approvals: ${pending.length}`,
    });
    return {
      parsedIntent: "List items waiting for approval",
      actionPlan: ["Fetch pending approval queue", "Return summary to user"],
      policyDecision: {
        allowed: true,
        needsApproval: false,
        matchedRules: ["read_only"],
      },
      risk: {
        level: "LOW",
        reasons: ["Read-only query"],
        recommendedAction: "auto_execute",
      },
      execution: {
        status: "success",
        message: `${pending.length} approval(s) pending. Open Approvals for details.`,
      },
    };
  }

  if (intent.kind === "pause_subscriptions") {
    logAudit({
      user: user.email,
      actionType: "subscription_analysis",
      provider: "mock_billing",
      riskLevel: "LOW",
      matchedPolicyRules: ["manual_followup"],
      approvalStatus: "not_required",
      executionStatus: "skipped",
      notes: "Duplicate subscription pause requires provider UI — sandbox only.",
    });
    return {
      parsedIntent: "Pause duplicate subscriptions",
      actionPlan: [
        "Analyze recurring merchants",
        "Suggest duplicates (mock)",
        "User confirms in real product",
      ],
      policyDecision: {
        allowed: true,
        needsApproval: false,
        matchedRules: ["informational"],
      },
      risk: {
        level: "LOW",
        reasons: ["No funds moved in sandbox"],
        recommendedAction: "auto_execute",
      },
      execution: {
        status: "skipped",
        message:
          "No duplicate charges detected in mock data. In production, StreamBox vs. similar merchants would be compared.",
      },
    };
  }

  if (intent.kind === "savings_transfer") {
    const amount = intent.amount ?? 100;
    if (!accessSavings) {
      return blocked("Savings wallet not connected — connect in Token Vault.");
    }
    const pol = evaluatePolicy(policy, "mock_savings", {
      amount,
      isFirstTimePayee: false,
      isNewExternalAccount: false,
      isSavingsTransfer: true,
      isNight: policy.blockActionsAtNight && isNightHour(new Date()),
      dailySpendCommitted: getDailySpend(),
    });
    const risk = assessRisk(policy, {
      amount,
      isRecurringPayee: true,
      isNewPayee: false,
      isNewExternalAccount: false,
      belowAutoPayThreshold: true,
      isNightBlocked: !!(
        policy.blockActionsAtNight &&
        isNightHour(new Date()) &&
        pol.matchedRules.includes("block_actions_at_night")
      ),
      exceedsDailyLimit: false,
      policyRequiresApproval: pol.needsApproval && !pol.allowed,
    });

    if (!pol.allowed) {
      logAudit({
        user: user.email,
        actionType: "savings_transfer_denied",
        provider: "mock_savings",
        amount,
        riskLevel: "MEDIUM",
        matchedPolicyRules: pol.matchedRules,
        approvalStatus: "not_required",
        executionStatus: "failed",
        notes: pol.denialReason,
      });
      return {
        parsedIntent: `Move $${amount} to savings`,
        actionPlan: ["Validate savings policy", "Stop — policy denied"],
        policyDecision: {
          allowed: false,
          needsApproval: false,
          matchedRules: pol.matchedRules,
          denialReason: pol.denialReason,
        },
        risk,
        execution: { status: "failed", message: pol.denialReason ?? "Denied" },
      };
    }

    if (pol.needsApproval) {
      const appr = addApproval({
        title: `Move $${amount} to savings (night window)`,
        amount,
        provider: "mock_savings",
        riskLevel: "MEDIUM",
        reason: pol.approvalReason ?? "Approval required",
      });
      logAudit({
        user: user.email,
        actionType: "savings_transfer_pending",
        provider: "mock_savings",
        amount,
        riskLevel: "MEDIUM",
        matchedPolicyRules: pol.matchedRules,
        approvalStatus: "pending",
        executionStatus: "pending",
        notes: appr.id,
      });
      return {
        parsedIntent: `Move $${amount} to savings`,
        actionPlan: ["Queue transfer", "Await approval"],
        policyDecision: {
          allowed: true,
          needsApproval: true,
          matchedRules: pol.matchedRules,
          approvalReason: pol.approvalReason,
        },
        risk,
        execution: {
          status: "pending",
          message: "Queued for approval due to policy.",
          approvalId: appr.id,
        },
      };
    }

    const res = mockSavings.moveToSavings(amount, "Payday sweep");
    logAudit({
      user: user.email,
      actionType: "savings_transfer",
      provider: "mock_savings",
      amount,
      riskLevel: risk.level,
      matchedPolicyRules: pol.matchedRules,
      approvalStatus: "not_required",
      executionStatus: "success",
      notes: res.message,
    });
    return {
      parsedIntent: `Move $${amount} to savings on payday`,
      actionPlan: ["Verify Token Vault savings scope", "Post sandbox transfer"],
      policyDecision: {
        allowed: true,
        needsApproval: false,
        matchedRules: pol.matchedRules,
      },
      risk,
      execution: { status: "success", message: res.message },
    };
  }

  if (intent.kind === "external_transfer") {
    const amount = intent.amount ?? 1200;
    if (!accessBank) {
      return blocked("Mock Bank not connected.");
    }
    const pol = evaluatePolicy(policy, "mock_bank", {
      amount,
      isFirstTimePayee: true,
      isNewExternalAccount: true,
      isSavingsTransfer: false,
      isNight: policy.blockActionsAtNight && isNightHour(new Date()),
      dailySpendCommitted: getDailySpend(),
    });
    const risk = assessRisk(policy, {
      amount,
      isRecurringPayee: false,
      isNewPayee: true,
      isNewExternalAccount: true,
      belowAutoPayThreshold: false,
      isNightBlocked: false,
      exceedsDailyLimit: getDailySpend() + amount > policy.maxDailyAutomatedSpend,
      policyRequiresApproval: true,
    });

    const appr = addApproval({
      title: `Transfer $${amount.toLocaleString()} to New External Account`,
      amount,
      provider: "mock_bank",
      riskLevel: "HIGH",
      reason:
        "New external account and elevated amount — explicit approval required.",
      metadata: { destination: "New External Account" },
    });
    logAudit({
      user: user.email,
      actionType: "external_transfer_pending",
      provider: "mock_bank",
      amount,
      payee: "New External Account",
      riskLevel: "HIGH",
      matchedPolicyRules: pol.matchedRules,
      approvalStatus: "pending",
      executionStatus: "pending",
      notes: appr.id,
    });
    return {
      parsedIntent: `Transfer $${amount} to a new external account`,
      actionPlan: [
        "Classify as new external destination",
        "Do not auto-execute",
        "Open approval in inbox",
      ],
      policyDecision: {
        allowed: true,
        needsApproval: true,
        matchedRules: pol.matchedRules,
        approvalReason:
          pol.approvalReason ?? "New external accounts require approval.",
      },
      risk,
      execution: {
        status: "pending",
        message: "Held for approval — high risk external transfer.",
        approvalId: appr.id,
      },
    };
  }

  if (intent.kind === "pay_bill_under") {
    if (!accessBilling) {
      return blocked("Billing provider not connected.");
    }
    const bill = billForKeyword(intent.billKeyword);
    if (!bill) {
      return {
        parsedIntent: command,
        actionPlan: ["Locate bill"],
        policyDecision: {
          allowed: false,
          needsApproval: false,
          matchedRules: [],
          denialReason: "No matching bill in mock data.",
        },
        risk: {
          level: "LOW",
          reasons: ["No bill"],
          recommendedAction: "block",
        },
        execution: { status: "failed", message: "Bill not found." },
      };
    }

    const threshold = intent.threshold ?? policy.autoPayThreshold;
    const below = bill.amount <= threshold;
    const pol = evaluatePolicy(policy, "mock_billing", {
      amount: bill.amount,
      isFirstTimePayee: false,
      isNewExternalAccount: false,
      isSavingsTransfer: false,
      isNight: policy.blockActionsAtNight && isNightHour(new Date()),
      dailySpendCommitted: getDailySpend(),
    });

    const risk = assessRisk(policy, {
      amount: bill.amount,
      isRecurringPayee: bill.recurring,
      isNewPayee: false,
      isNewExternalAccount: false,
      belowAutoPayThreshold: bill.amount <= policy.autoPayThreshold,
      isNightBlocked: !!(policy.blockActionsAtNight && isNightHour(new Date())),
      exceedsDailyLimit: getDailySpend() + bill.amount > policy.maxDailyAutomatedSpend,
      policyRequiresApproval: pol.needsApproval,
    });

    // Flow D / user cap: bill above policy auto-pay limit, or above user-stated cap in command
    if (!below || bill.amount > policy.autoPayThreshold) {
      const appr = addApproval({
        title: `${bill.category} bill $${bill.amount} (${bill.payee})`,
        amount: bill.amount,
        payee: bill.payee,
        provider: "mock_billing",
        riskLevel: bill.amount > policy.autoPayThreshold ? "MEDIUM" : "LOW",
        reason:
          bill.amount > policy.autoPayThreshold
            ? `Amount exceeds auto-pay threshold ($${policy.autoPayThreshold}).`
            : `Above the limit stated in your command ($${threshold}).`,
      });
      logAudit({
        user: user.email,
        actionType: "bill_pay_pending",
        provider: "mock_billing",
        amount: bill.amount,
        payee: bill.payee,
        riskLevel: risk.level,
        matchedPolicyRules: [...pol.matchedRules, "threshold_gate"],
        approvalStatus: "pending",
        executionStatus: "pending",
        notes: appr.id,
      });
      return {
        parsedIntent: `Pay ${bill.payee} if under $${threshold}`,
        actionPlan: [
          `Bill ${bill.payee} is $${bill.amount}`,
          "Threshold check failed — route to approvals",
        ],
        policyDecision: {
          allowed: true,
          needsApproval: true,
          matchedRules: pol.matchedRules,
          approvalReason: `Bill exceeds auto-pay limit ($${policy.autoPayThreshold}).`,
        },
        risk,
        execution: {
          status: "pending",
          message: `Queued: ${bill.payee} $${bill.amount} needs approval.`,
          approvalId: appr.id,
        },
      };
    }

    if (pol.needsApproval || risk.recommendedAction !== "auto_execute") {
      const appr = addApproval({
        title: `Pay ${bill.payee} $${bill.amount}`,
        amount: bill.amount,
        payee: bill.payee,
        provider: "mock_billing",
        riskLevel: risk.level,
        reason: pol.approvalReason ?? risk.reasons[0] ?? "Approval required",
      });
      logAudit({
        user: user.email,
        actionType: "bill_pay_pending",
        provider: "mock_billing",
        amount: bill.amount,
        payee: bill.payee,
        riskLevel: risk.level,
        matchedPolicyRules: pol.matchedRules,
        approvalStatus: "pending",
        executionStatus: "pending",
        notes: appr.id,
      });
      return {
        parsedIntent: `Pay ${bill.payee} under $${threshold}`,
        actionPlan: ["Evaluate policy", "Hold for approval"],
        policyDecision: {
          allowed: true,
          needsApproval: true,
          matchedRules: pol.matchedRules,
          approvalReason: pol.approvalReason,
        },
        risk,
        execution: {
          status: "pending",
          message: "Held by policy — see Approvals.",
          approvalId: appr.id,
        },
      };
    }

    const pay = mockBilling.executePayment(bill.payee, bill.amount);
    logAudit({
      user: user.email,
      actionType: "bill_pay_executed",
      provider: "mock_billing",
      amount: bill.amount,
      payee: bill.payee,
      riskLevel: "LOW",
      matchedPolicyRules: pol.matchedRules,
      approvalStatus: "not_required",
      executionStatus: "success",
      notes: pay.message,
    });
    return {
      parsedIntent: `Pay ${bill.payee} if under $${threshold}`,
      actionPlan: [
        `Verify recurring payee ${bill.payee}`,
        "Token Vault billing scope OK",
        "Execute sandbox payment",
      ],
      policyDecision: {
        allowed: true,
        needsApproval: false,
        matchedRules: pol.matchedRules,
      },
      risk,
      execution: { status: "success", message: pay.message },
    };
  }

  return {
    parsedIntent: "Unknown or unsupported command",
    actionPlan: ["Try: pay internet under $120", "move $100 to savings", "show approvals"],
    policyDecision: {
      allowed: false,
      needsApproval: false,
      matchedRules: [],
      denialReason: "Could not parse intent",
    },
    risk: {
      level: "LOW",
      reasons: ["No action taken"],
      recommendedAction: "block",
    },
    execution: {
      status: "failed",
      message:
        'Try: "Pay my internet bill if it\'s under $120" or "Show anything waiting for approval".',
    },
  };
}

function blocked(message: string): AgentCommandResult {
  return {
    parsedIntent: "blocked",
    actionPlan: [],
    policyDecision: {
      allowed: false,
      needsApproval: false,
      matchedRules: [],
      denialReason: message,
    },
    risk: {
      level: "HIGH",
      reasons: [message],
      recommendedAction: "block",
    },
    execution: { status: "failed", message },
  };
}

export function approvePending(id: string): { ok: boolean; message: string } {
  const pending = getApprovals().find((a) => a.id === id);
  if (!pending) return { ok: false, message: "Approval not found." };
  removeApproval(id);

  if (pending.provider === "mock_bank" && pending.title.includes("External")) {
    const res = mockBank.createTransfer(pending.amount, "New External Account");
    logAudit({
      user: getCurrentUser().email,
      actionType: "external_transfer_executed",
      provider: "mock_bank",
      amount: pending.amount,
      payee: "New External Account",
      riskLevel: "HIGH",
      matchedPolicyRules: ["post_approval_execute"],
      approvalStatus: "approved",
      executionStatus: "success",
      notes: res.message,
    });
    return { ok: true, message: res.message };
  }

  if (pending.provider === "mock_billing") {
    const payee = pending.payee ?? "MetroNet";
    const pay = mockBilling.executePayment(payee, pending.amount);
    logAudit({
      user: getCurrentUser().email,
      actionType: "bill_pay_executed",
      provider: "mock_billing",
      amount: pending.amount,
      riskLevel: pending.riskLevel,
      matchedPolicyRules: ["post_approval_execute"],
      approvalStatus: "approved",
      executionStatus: "success",
      notes: pay.message,
    });
    return { ok: true, message: pay.message };
  }

  if (pending.provider === "mock_savings") {
    const res = mockSavings.moveToSavings(pending.amount, "Approved transfer");
    logAudit({
      user: getCurrentUser().email,
      actionType: "savings_transfer",
      provider: "mock_savings",
      amount: pending.amount,
      riskLevel: "MEDIUM",
      matchedPolicyRules: ["post_approval_execute"],
      approvalStatus: "approved",
      executionStatus: "success",
      notes: res.message,
    });
    return { ok: true, message: res.message };
  }

  return { ok: true, message: "Processed." };
}

export function rejectPending(id: string): { ok: boolean; message: string } {
  const pending = getApprovals().find((a) => a.id === id);
  if (!pending) return { ok: false, message: "Approval not found." };
  removeApproval(id);
  logAudit({
    user: getCurrentUser().email,
    actionType: "approval_rejected",
    provider: pending.provider,
    amount: pending.amount,
    riskLevel: pending.riskLevel,
    matchedPolicyRules: ["user_rejected"],
    approvalStatus: "rejected",
    executionStatus: "skipped",
    notes: pending.title,
  });
  return { ok: true, message: "Request rejected and logged." };
}
