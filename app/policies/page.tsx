"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { PolicyRuleCard } from "@/components/vault/policy-rule-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { SectionHeader } from "@/components/vault/section-header";
import { useDemoState } from "@/hooks/use-demo-state";
import type { UserPolicy } from "@/lib/types";

export default function PoliciesPage() {
  const { data, loading, refresh } = useDemoState();
  const [policy, setPolicy] = useState<UserPolicy | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (data?.policy) setPolicy(data.policy);
  }, [data]);

  if (loading || !data || !policy) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading policies…
      </div>
    );
  }

  async function save() {
    setSaving(true);
    setToast(null);
    try {
      await fetch("/api/policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policy),
      });
      setToast("Policy saved. Changes apply to the next agent evaluation.");
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell pendingCount={data.approvals.length}>
      <SectionHeader
        title="Policy Center"
        description="You define the boundaries. The agent evaluates every command against these rules before execution or approval routing."
      />

      {toast && (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          {toast}
        </p>
      )}

      <div className="grid max-w-3xl gap-6">
        <PolicyRuleCard title="Spending & bills">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label>Auto-pay recurring bills under</Label>
                <span className="text-sm font-medium">
                  ${policy.autoPayThreshold}
                </span>
              </div>
              <Slider
                value={[policy.autoPayThreshold]}
                min={25}
                max={300}
                step={5}
                onValueChange={([v]) =>
                  setPolicy((p) => (p ? { ...p, autoPayThreshold: v } : p))
                }
              />
              <p className="flex gap-2 text-xs text-muted-foreground">
                <Info className="size-3.5 shrink-0" />
                Bills above this amount route to approvals even if recurring.
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>Require approval for first-time payees</Label>
                <p className="text-xs text-muted-foreground">
                  New merchants never auto-debit without a prior approval.
                </p>
              </div>
              <Switch
                checked={policy.requireApprovalFirstTimePayee}
                onCheckedChange={(v) =>
                  setPolicy((p) =>
                    p ? { ...p, requireApprovalFirstTimePayee: v } : p,
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Maximum daily automated spend</Label>
              <Input
                type="number"
                value={policy.maxDailyAutomatedSpend}
                onChange={(e) =>
                  setPolicy((p) =>
                    p
                      ? {
                          ...p,
                          maxDailyAutomatedSpend: Number(e.target.value),
                        }
                      : p,
                  )
                }
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label>Generic approval threshold</Label>
                <span className="text-sm font-medium">
                  ${policy.approvalThreshold}
                </span>
              </div>
              <Slider
                value={[policy.approvalThreshold]}
                min={50}
                max={2000}
                step={25}
                onValueChange={([v]) =>
                  setPolicy((p) => (p ? { ...p, approvalThreshold: v } : p))
                }
              />
              <p className="text-xs text-muted-foreground">
                Amounts above this generally require explicit approval unless
                policy explicitly allows.
              </p>
            </div>
        </PolicyRuleCard>

        <PolicyRuleCard title="Savings & schedules">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>Allow savings transfers</Label>
                <p className="text-xs text-muted-foreground">
                  When off, payday sweeps and savings moves are blocked.
                </p>
              </div>
              <Switch
                checked={policy.allowSavingsTransfers}
                onCheckedChange={(v) =>
                  setPolicy((p) => (p ? { ...p, allowSavingsTransfers: v } : p))
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>Block automated actions at night</Label>
                <p className="text-xs text-muted-foreground">
                  10pm–6am local window queues actions for approval.
                </p>
              </div>
              <Switch
                checked={policy.blockActionsAtNight}
                onCheckedChange={(v) =>
                  setPolicy((p) => (p ? { ...p, blockActionsAtNight: v } : p))
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>Require approval for new external accounts</Label>
                <p className="text-xs text-muted-foreground">
                  First-time external destinations always wait for human approval.
                </p>
              </div>
              <Switch
                checked={policy.requireApprovalNewExternalAccounts}
                onCheckedChange={(v) =>
                  setPolicy((p) =>
                    p ? { ...p, requireApprovalNewExternalAccounts: v } : p,
                  )
                }
              />
            </div>
        </PolicyRuleCard>

        <Button onClick={save} disabled={saving} className="w-fit">
          {saving ? "Saving…" : "Save policy"}
        </Button>
      </div>
    </AppShell>
  );
}
