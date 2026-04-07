"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RiskBadge } from "@/components/vault/risk-badge";
import type { AgentCommandResult } from "@/lib/types";

export function CommandPanel({ onRan }: { onRan?: () => void }) {
  const [text, setText] = useState(
    "Pay my internet bill if it's under $120",
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentCommandResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setResult(data as AgentCommandResult);
      onRan?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Agent command panel</CardTitle>
        <CardDescription>
          Deterministic parser for demo reliability. Commands are evaluated
          against your policy, risk model, and Token Vault scopes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[88px] resize-none font-mono text-sm"
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={run} disabled={loading}>
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Run command
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setText("Transfer $1,200 to a new external account")
            }
          >
            Try high-risk transfer
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setText("Move $100 to savings on payday")}
          >
            Try savings move
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-destructive"
            >
              {error}
            </motion.p>
          )}
          {result && (
            <motion.div
              key="out"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3 rounded-lg border bg-muted/30 p-4 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">Parsed intent</span>
                <span className="text-muted-foreground">{result.parsedIntent}</span>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Action plan
                </p>
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  {result.actionPlan.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Policy</p>
                  <p>
                    {result.policyDecision.allowed ? "Allowed" : "Blocked"}
                    {result.policyDecision.needsApproval && " · needs approval"}
                  </p>
                  {result.policyDecision.matchedRules.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Rules: {result.policyDecision.matchedRules.join(", ")}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Risk</p>
                  <RiskBadge level={result.risk.level} />
                </div>
              </div>
              {result.execution && (
                <div className="rounded-md bg-background/80 p-3 text-sm">
                  <span className="font-medium">Result: </span>
                  {result.execution.message}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
