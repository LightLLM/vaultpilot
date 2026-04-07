"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_USER } from "@/lib/auth";

const quick = [
  ["/dashboard", "Home"],
  ["/connect", "Connect"],
  ["/policies", "Policies"],
  ["/approvals", "Approvals"],
];

export function TopBar({ pendingCount }: { pendingCount: number }) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-card/80 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium text-foreground">{DEMO_USER.email}</span>
        </span>
        <Badge variant="secondary" className="font-normal">
          Sandbox · no real funds
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <nav className="mr-2 hidden flex-wrap gap-2 text-xs font-medium text-muted-foreground sm:flex md:hidden">
          {quick.map(([href, label]) => (
            <Link key={href} href={href} className="hover:text-foreground">
              {label}
            </Link>
          ))}
        </nav>
        {pendingCount > 0 && (
          <Badge variant="warning">
            {pendingCount} pending approval{pendingCount === 1 ? "" : "s"}
          </Badge>
        )}
        <Button variant="outline" size="sm" asChild>
          <Link href="/approvals">Open approvals</Link>
        </Button>
      </div>
    </header>
  );
}
