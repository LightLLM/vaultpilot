"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProviderConnection } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

const labels: Record<ProviderConnection["provider"], string> = {
  mock_bank: "Mock Bank",
  mock_billing: "Mock Billing Provider",
  mock_savings: "Mock Savings Wallet",
};

export function ProviderCard({
  connection,
  onConnect,
  onRevoke,
}: {
  connection: ProviderConnection;
  onConnect: () => void;
  onRevoke: () => void;
}) {
  const title = labels[connection.provider];
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="mt-1">
                Delegated access is brokered through Auth0 Token Vault — tokens
                never sit in browser state.
              </CardDescription>
            </div>
            {connection.connected ? (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="size-3" /> Connected
              </Badge>
            ) : (
              <Badge variant="secondary">Disconnected</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-lg border bg-muted/40 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Shield className="size-3.5" />
              Secured via Token Vault
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Short-lived credentials are issued server-side per scope. Revoke
              here to invalidate vault-backed access for this integration.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Scopes</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {(connection.scopes.length ? connection.scopes : ["—"]).map((s) => (
                <Badge key={s} variant="outline" className="font-mono text-[10px]">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Last consent:{" "}
            {connection.lastConsentAt
              ? formatDateTime(connection.lastConsentAt)
              : "—"}
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          {!connection.connected ? (
            <Button size="sm" onClick={onConnect}>
              Connect provider
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={onRevoke}>
              Revoke access
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
