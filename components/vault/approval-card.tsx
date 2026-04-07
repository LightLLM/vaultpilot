"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RiskBadge } from "@/components/vault/risk-badge";
import type { PendingApproval } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const providerLabel = {
  mock_bank: "Mock Bank",
  mock_billing: "Mock Billing",
  mock_savings: "Mock Savings",
};

export function ApprovalCard({
  item,
  onDone,
}: {
  item: PendingApproval;
  onDone: () => void;
}) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function act(action: "approve" | "reject") {
    setLoading(action);
    try {
      await fetch("/api/approvals", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, action }),
      });
      onDone();
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{item.title}</CardTitle>
          <RiskBadge level={item.riskLevel} />
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="secondary">{providerLabel[item.provider]}</Badge>
          <span className="font-semibold">{formatCurrency(item.amount)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{item.reason}</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          size="sm"
          onClick={() => act("approve")}
          disabled={loading !== null}
        >
          {loading === "approve" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => act("reject")}
          disabled={loading !== null}
        >
          {loading === "reject" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Reject
        </Button>
      </CardFooter>
    </Card>
  );
}
