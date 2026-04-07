"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RiskBadge } from "@/components/vault/risk-badge";
import type { AuditEntry } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function ActivityTimeline({ entries }: { entries: AuditEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit trail</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Policy</TableHead>
              <TableHead>Approval</TableHead>
              <TableHead>Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="whitespace-nowrap text-xs">
                  {formatDateTime(e.timestamp)}
                </TableCell>
                <TableCell className="max-w-[200px] text-xs">
                  {e.actionType}
                  {e.payee && (
                    <span className="block text-muted-foreground">{e.payee}</span>
                  )}
                </TableCell>
                <TableCell className="text-xs">{e.provider}</TableCell>
                <TableCell>
                  <RiskBadge level={e.riskLevel} />
                </TableCell>
                <TableCell className="max-w-[220px] text-xs text-muted-foreground">
                  {e.matchedPolicyRules.join(", ")}
                </TableCell>
                <TableCell className="text-xs">{e.approvalStatus}</TableCell>
                <TableCell className="text-xs">{e.executionStatus}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
