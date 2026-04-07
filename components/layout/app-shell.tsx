"use client";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { TopBar } from "@/components/layout/top-bar";

export function AppShell({
  children,
  pendingCount = 0,
}: {
  children: React.ReactNode;
  pendingCount?: number;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-56 shrink-0 border-r bg-card/50 md:block">
        <SidebarNav />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar pendingCount={pendingCount} />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
