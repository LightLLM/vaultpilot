"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_USER } from "@/lib/auth";

const quick = [
  ["/dashboard", "Home"],
  ["/connect", "Connect"],
  ["/policies", "Policies"],
  ["/approvals", "Approvals"],
];

type AuthStatus = {
  auth0Enabled: boolean;
  signedIn: boolean;
  email: string | null;
};

export function TopBar({ pendingCount }: { pendingCount: number }) {
  const [status, setStatus] = useState<AuthStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/status", { credentials: "include" });
        const json = (await res.json()) as AuthStatus;
        if (!cancelled) setStatus(json);
      } catch {
        if (!cancelled)
          setStatus({
            auth0Enabled: false,
            signedIn: true,
            email: DEMO_USER.email,
          });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const email =
    status?.email ??
    (!status?.auth0Enabled ? DEMO_USER.email : "…");
  const showSignIn = status?.auth0Enabled && !status?.signedIn;

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card/80 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {showSignIn ? (
            <>Not signed in</>
          ) : (
            <>
              Signed in as{" "}
              <span className="font-medium text-foreground">{email}</span>
            </>
          )}
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
        {status?.auth0Enabled && (
          <div className="mr-1 flex items-center gap-2">
            {showSignIn ? (
              <Button variant="default" size="sm" asChild>
                <a href="/auth/login">Log in</a>
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <a href="/auth/logout">Log out</a>
              </Button>
            )}
          </div>
        )}
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
