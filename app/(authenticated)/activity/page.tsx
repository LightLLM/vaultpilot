"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ActivityTimeline } from "@/components/vault/activity-timeline";
import { SectionHeader } from "@/components/vault/section-header";
import { useDemoState } from "@/hooks/use-demo-state";

export default function ActivityPage() {
  const { data, loading } = useDemoState();

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading activity…
      </div>
    );
  }

  return (
    <AppShell pendingCount={data.approvals.length}>
      <SectionHeader
        title="Activity log"
        description="Structured audit entries for every policy evaluation, risk score, approval decision, and sandbox execution outcome."
      />
      <ActivityTimeline entries={data.audit} />
    </AppShell>
  );
}
