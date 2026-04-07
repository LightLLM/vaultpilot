"use client";

import Link from "next/link";
import { Activity, AlertTriangle, CheckCircle2, Wallet } from "lucide-react";
import { SpendTrend } from "@/components/dashboard/spend-trend";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommandPanel } from "@/components/vault/command-panel";
import { MetricCard } from "@/components/vault/metric-card";
import { SectionHeader } from "@/components/vault/section-header";
import { useDemoState } from "@/hooks/use-demo-state";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { data, loading, refresh } = useDemoState();

  if (loading || !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Loading dashboard…
      </div>
    );
  }

  const connected = Object.values(data.connections).filter((c) => c.connected)
    .length;
  const pending = data.approvals.length;
  const headroom = Math.max(
    0,
    data.policy.maxDailyAutomatedSpend - data.dailySpend,
  );
  const riskPosture =
    pending > 0 ? "Attention needed" : data.dailySpend < 150 ? "Healthy" : "Watch";

  return (
    <AppShell pendingCount={pending}>
      <SectionHeader
        title="Dashboard"
        description="Operational snapshot of connected providers, policy headroom, pending approvals, and recent agent activity."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Connected providers"
          value={`${connected}/3`}
          hint="Vault-backed mock integrations"
          icon={CheckCircle2}
        />
        <MetricCard
          title="Pending approvals"
          value={String(pending)}
          hint="High or policy-blocked actions"
          icon={AlertTriangle}
        />
        <MetricCard
          title="Daily automated spend"
          value={formatCurrency(data.dailySpend)}
          hint={`Headroom ${formatCurrency(headroom)} / ${formatCurrency(data.policy.maxDailyAutomatedSpend)}`}
          icon={Wallet}
        />
        <MetricCard
          title="Risk posture"
          value={riskPosture}
          hint="Based on approvals + spend velocity"
          icon={Activity}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Automated spend trend</CardTitle>
            <Badge variant="secondary">Mock data</Badge>
          </CardHeader>
          <CardContent>
            <SpendTrend />
          </CardContent>
        </Card>

        <CommandPanel onRan={refresh} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Policy summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Auto-pay under {formatCurrency(data.policy.autoPayThreshold)} ·
              Approval over {formatCurrency(data.policy.approvalThreshold)}
            </p>
            <p>
              Max daily automated spend{" "}
              {formatCurrency(data.policy.maxDailyAutomatedSpend)} · Savings
              transfers {data.policy.allowSavingsTransfers ? "on" : "off"}
            </p>
            <Button variant="link" className="h-auto px-0" asChild>
              <Link href="/policies">Edit policies</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.audit.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className="flex items-start justify-between gap-2 border-b border-dashed pb-2 last:border-0"
              >
                <div>
                  <p className="font-medium">{a.actionType}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.executionStatus} · {a.approvalStatus}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(a.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
            <Button variant="outline" size="sm" asChild>
              <Link href="/activity">Full activity log</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
