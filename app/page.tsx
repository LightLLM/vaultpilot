"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ClipboardList,
  Lock,
  Radar,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    title: "Trust by design",
    body: "Scoped provider access through Auth0 Token Vault — secrets never live in the UI layer.",
    icon: ShieldCheck,
  },
  {
    title: "Controls you set",
    body: "Auto-pay limits, approval thresholds, and night-time blocks keep automation inside your rules.",
    icon: Radar,
  },
  {
    title: "Approvals first",
    body: "High-risk moves queue in your inbox — the agent never silently escalates privilege.",
    icon: ClipboardList,
  },
  {
    title: "Audit everything",
    body: "Structured logs for policy matches, risk scores, and execution outcomes — investor-grade traceability.",
    icon: Sparkles,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Lock className="size-5 text-primary" />
          VaultPilot
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/security">Security</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <section className="grid gap-12 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-24">
          <div>
            <Badge variant="secondary" className="mb-4">
              Authorized to Act · Hackathon MVP
            </Badge>
            <motion.h1
              className="text-4xl font-semibold tracking-tight md:text-5xl"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              VaultPilot
            </motion.h1>
            <p className="mt-4 text-xl text-muted-foreground md:text-2xl">
              Your AI can help with money tasks. It just can&apos;t overstep.
            </p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              VaultPilot is a personal finance execution agent that automates
              routine actions using user-defined policies, secure delegated access
              through Auth0, explicit approvals, and a complete audit trail.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Launch demo <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/connect">See Token Vault model</Link>
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Sandbox environment — no real funds, no live bank connections.
              Demonstrates authorization patterns suitable for production design
              reviews.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="rounded-2xl border bg-card p-6 shadow-sm"
          >
            <p className="text-sm font-medium">Architecture snapshot</p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-mono text-xs text-primary">01</span>
                Auth0 for identity and session security
              </li>
              <li className="flex gap-2">
                <span className="font-mono text-xs text-primary">02</span>
                Token Vault brokers scoped tokens to mock providers
              </li>
              <li className="flex gap-2">
                <span className="font-mono text-xs text-primary">03</span>
                Policy + risk engines gate every action
              </li>
              <li className="flex gap-2">
                <span className="font-mono text-xs text-primary">04</span>
                Immutable-style audit log for judges & investors
              </li>
            </ul>
          </motion.div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <f.icon className="size-8 text-primary" />
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {f.body}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </section>

        <section className="mt-20 grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
              <CardDescription>
                A tight execution loop with human checkpoints where risk rises.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                1. Connect mock providers with vault-mediated scopes.
              </p>
              <p>
                2. Set policies — thresholds, night blocks, savings rules.
              </p>
              <p>
                3. Issue commands; the agent parses intent and evaluates risk.
              </p>
              <p>
                4. Safe actions execute; sensitive ones wait in Approvals.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Why boundaries matter</CardTitle>
              <CardDescription>
                AI agents should not inherit blanket authority over money movement.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Delegation without scoped credentials and policy gates is unsafe
                by default. VaultPilot shows how to pair Auth0 sessions with Token
                Vault–backed provider access, approvals, and tamper-evident logging
                so automation stays accountable.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-16 rounded-2xl border bg-primary p-8 text-primary-foreground md:p-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                Delegate routine money actions without surrendering control.
              </h2>
              <p className="mt-2 max-w-2xl text-primary-foreground/90">
                Safe financial automation with explicit approval boundaries — built
                for demos that need to feel production-real.
              </p>
            </div>
            <Button
              size="lg"
              variant="secondary"
              className="shrink-0"
              asChild
            >
              <Link href="/dashboard">Enter VaultPilot</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-10 text-center text-xs text-muted-foreground">
        VaultPilot · Mock data only · Auth0 Token Vault architecture simulated for local development
      </footer>
    </div>
  );
}
