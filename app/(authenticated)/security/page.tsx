"use client";

import Link from "next/link";
import { KeyRound, Lock, Server } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SecurityScopesList } from "@/components/vault/security-scopes-list";
import { SectionHeader } from "@/components/vault/section-header";
import { useDemoState } from "@/hooks/use-demo-state";

export default function SecurityPage() {
  const { data, loading } = useDemoState();

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading security…
      </div>
    );
  }

  const connections = Object.values(data.connections);

  return (
    <AppShell pendingCount={data.approvals.length}>
      <SectionHeader
        title="Security"
        description="VaultPilot separates identity (Auth0), delegated provider access (Token Vault), and execution policy. Tokens never pass through client-side app logic."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="size-5 text-primary" />
              <CardTitle>Auth0 Token Vault</CardTitle>
            </div>
            <CardDescription className="text-base leading-relaxed">
              Third-party OAuth tokens are stored in Auth0&apos;s vault, not in
              VaultPilot&apos;s database or browser storage. Your backend exchanges
              the user&apos;s Auth0 session for short-lived, scoped credentials
              when calling mock providers — mirroring how production aggregators
              and bill-pay APIs should be invoked.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                lib/token-vault.ts
              </code>{" "}
              is the integration seam. Replace mock lookups with Token Vault API
              calls using your Auth0 tenant configuration.
            </p>
            <p>
              Frontend components only render connection status; they never see
              refresh tokens or long-lived secrets.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="size-5" />
              <CardTitle>Why not raw tokens?</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Embedding provider tokens in JavaScript bundles or mobile storage
              multiplies breach impact. Vault-backed delegation limits blast radius
              and enables instant revocation from one place.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Granted scopes by provider</h2>
        <SecurityScopesList connections={connections} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="size-5" />
              <CardTitle>Agent capabilities</CardTitle>
            </div>
            <CardDescription>
              The agent can only perform actions allowed by both policy engine
              rules and Token Vault scopes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Read balances & bills when providers are connected.</p>
            <p>• Initiate sandbox payments and transfers after evaluation.</p>
            <p>• Never bypass approvals for high-risk or policy-blocked flows.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Permission boundaries</CardTitle>
            <CardDescription>
              Revoke provider access anytime — vault references invalidate on disconnect.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Manage mock connections on the Connect page. In production, the same
              action calls Auth0 to revoke refresh tokens at the source.
            </p>
            <Button variant="outline" asChild>
              <Link href="/connect">Open connections</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
