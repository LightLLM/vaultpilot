import { Badge } from "@/components/ui/badge";
import type { RiskLevel } from "@/lib/types";

const map: Record<RiskLevel, { label: string; variant: "success" | "warning" | "destructive" }> = {
  LOW: { label: "Low", variant: "success" },
  MEDIUM: { label: "Medium", variant: "warning" },
  HIGH: { label: "High", variant: "destructive" },
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  const m = map[level];
  return <Badge variant={m.variant}>{m.label} risk</Badge>;
}
