"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  AuditEntry,
  Bill,
  PendingApproval,
  ProviderConnection,
  UserPolicy,
} from "@/lib/types";

export type DemoState = {
  policy: UserPolicy;
  approvals: PendingApproval[];
  audit: AuditEntry[];
  dailySpend: number;
  bills: Bill[];
  connections: Record<string, ProviderConnection>;
};

export function useDemoState() {
  const [data, setData] = useState<DemoState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/state");
    const json = (await res.json()) as DemoState;
    setData(json);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await refresh();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return { data, loading, refresh };
}
