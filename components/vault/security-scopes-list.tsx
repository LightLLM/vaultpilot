import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProviderConnection } from "@/lib/types";

export function SecurityScopesList({
  connections,
}: {
  connections: ProviderConnection[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {connections.map((c) => (
        <Card key={c.provider}>
          <CardHeader>
            <CardTitle className="text-base capitalize">
              {c.provider.replace(/_/g, " ")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1">
            {(c.scopes.length ? c.scopes : ["No active scopes"]).map((s) => (
              <Badge key={s} variant="outline" className="font-mono text-[11px]">
                {s}
              </Badge>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
