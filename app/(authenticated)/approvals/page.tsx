"use client";

import { Inbox } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ApprovalCard } from "@/components/vault/approval-card";
import { EmptyState } from "@/components/vault/empty-state";
import { SectionHeader } from "@/components/vault/section-header";
import { useDemoState } from "@/hooks/use-demo-state";

export default function ApprovalsPage() {
  const { data, loading, refresh } = useDemoState();

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading approvals…
      </div>
    );
  }

  return (
    <AppShell pendingCount={data.approvals.length}>
      <SectionHeader
        title="Approvals inbox"
        description="Nothing executes here without your explicit consent. Approvals capture high-risk transfers, threshold breaches, and policy-mandated holds."
      />

      {data.approvals.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Inbox zero"
          description="When the agent needs you, pending actions appear here with risk context and provider details."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.approvals.map((a) => (
            <ApprovalCard key={a.id} item={a} onDone={refresh} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
