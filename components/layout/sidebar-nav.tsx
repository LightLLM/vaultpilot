"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  CreditCard,
  LayoutDashboard,
  Link2,
  Scale,
  Shield,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/connect", label: "Connect", icon: Link2 },
  { href: "/policies", label: "Policy Center", icon: Scale },
  { href: "/approvals", label: "Approvals", icon: Sparkles },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/security", label: "Security", icon: Shield },
];

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 p-3">
      <Link
        href="/"
        className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-foreground"
      >
        <CreditCard className="size-5 text-primary" />
        VaultPilot
      </Link>
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
