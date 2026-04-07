"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ProviderCard } from "@/components/vault/provider-card";
import { SectionHeader } from "@/components/vault/section-header";
import { useDemoState } from "@/hooks/use-demo-state";
import type { ProviderId } from "@/lib/types";

export default function ConnectPage() {
  const { data, loading, refresh } = useDemoState();

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading connections…
      </div>
    );
  }

  async function mutate(provider: ProviderId, action: "connect" | "revoke") {
    await fetch("/api/providers", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, action }),
    });
    await refresh();
  }

  const list = Object.values(data.connections);

  return (
    <AppShell pendingCount={data.approvals.length}>
      <SectionHeader
        title="Connect accounts"
        description="Each integration receives least-privilege scopes brokered through Auth0 Token Vault. Tokens are never stored in React state or localStorage."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <ProviderCard
            key={c.provider}
            connection={c}
            onConnect={() => void mutate(c.provider, "connect")}
            onRevoke={() => void mutate(c.provider, "revoke")}
          />
        ))}
      </div>
    </AppShell>
  );
}
