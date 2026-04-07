# VaultPilot

**Your AI can help with money tasks. It just can’t overstep.**

VaultPilot is a **personal finance execution agent** for the *Authorized to Act* hackathon. It automates **routine, user-approved money actions** inside explicit permission boundaries — not investing advice, not speculative trading, not autonomous risk-taking.

![Dashboard placeholder](https://placehold.co/1200x600/e2e8f0/1e293b?text=VaultPilot+Dashboard)

## The problem

Delegated automation without strong authorization is unsafe. Users need a way to let agents **act on their behalf** while keeping **scoped credentials**, **policy gates**, **human approvals**, and **auditability** first-class.

## What VaultPilot demonstrates

- **Auth0** for identity (simulated session in the MVP; integration points documented).
- **Auth0 Token Vault** as the **architectural backbone** for third-party access — tokens never live in React state or ad-hoc app storage (`lib/token-vault.ts`).
- **Policy engine** + **risk engine** for deterministic decisions on every command.
- **Approvals inbox** for high-risk flows (new external accounts, threshold breaches, night-window holds).
- **Structured audit log** for judges and security reviewers.

> **Honest scope:** This repo uses **mock banks, billers, and savings** — **no real money moves**, **no live credentials**. It showcases **authorization and delegation patterns** suitable for a production roadmap.

## Architecture

| Layer | Role |
|--------|------|
| **Auth0** | User authentication & session security (wired in production). |
| **Token Vault** | Vault-backed OAuth tokens per provider connection; short-lived access from backend only. |
| **Policy engine** | User-defined caps, thresholds, night blocks, savings toggles. |
| **Risk engine** | Classifies LOW / MEDIUM / HIGH and recommends auto / approval / block. |
| **Mock providers** | Sandbox `Mock Bank`, `Mock Billing`, `Mock Savings Wallet`. |
| **Audit log** | Append-only style event stream for every evaluation and outcome. |

## Auth0 Token Vault — why it’s central

OAuth **access and refresh tokens are bearer credentials**. Storing them in browser storage or React state is an anti-pattern. **Token Vault** (and Auth0’s secure connection model) keeps provider secrets in a **hardened store**; your app receives **scoped, time-bound access** on the server.

See **`lib/token-vault.ts`** for:

- `getDelegatedAccess`, `getGrantedScopes`, `revokeProvider`
- Comments marking **exact production integration seams**
- Mock implementation backed by in-memory demo state for local runs

## Features

- Landing page with product narrative and security positioning
- Dashboard: metrics, mock spend chart, command panel, recent activity
- Connect: provider cards with **“Secured via Token Vault”** messaging
- Policy Center: sliders, toggles, inputs for user rules
- Agent command panel: deterministic intent parsing (no live LLM)
- Approvals inbox with approve / reject → audit updates
- Activity log table
- Security view: scopes, boundaries, Token Vault explainer

## Routes

| Route | Description |
|--------|-------------|
| `/` | Marketing / hero / architecture overview |
| `/dashboard` | Metrics, chart, command panel, snapshot |
| `/connect` | Provider connections & scopes |
| `/policies` | Policy controls |
| `/approvals` | Pending human approvals |
| `/activity` | Audit timeline |
| `/security` | Security & Token Vault story |

## API (Next.js Route Handlers)

| Endpoint | Purpose |
|-----------|---------|
| `POST /api/agent` | Run agent command through policy + risk engines |
| `GET /api/state` | Snapshot: policy, approvals, audit, bills, connections |
| `POST /api/policy` | Persist policy (in-memory for MVP) |
| `POST /api/approvals` | Approve or reject pending id |
| `POST /api/providers` | Connect / revoke mock provider |
| `GET /api/mock/bills` | List mock bills |
| `POST /api/mock/payments` | Sandbox payment |
| `POST /api/mock/transfers` | Sandbox transfer |

## Demo flows

1. **Safe recurring bill (Flow A)**  
   Command: *“Pay my internet bill if it’s under $120”*  
   MetroNet $89, recurring, under policy auto-pay → **auto-executed** (sandbox), audit entry.

2. **Savings (Flow B)**  
   *“Move $100 to savings on payday”* → savings transfer when enabled → audit.

3. **High-risk approval (Flow C)**  
   *“Transfer $1,200 to a new external account”* → **pending approval**; approve in `/approvals` → mock transfer + audit.

4. **Threshold bill (Flow D)**  
   Electricity **$142** vs **$100** auto-pay cap → **approval required** with reason text.

## Local setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tests

Unit tests cover the behaviors described in this README: policy and risk engines, intent parsing, Token Vault helpers, mock providers, audit logging, README demo flows (A–D), and API route handlers.

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

Copy `.env.example` to `.env.local` when you add real Auth0 configuration.

## Tech stack

- Next.js (App Router), TypeScript, Tailwind CSS  
- shadcn/ui-style primitives, lucide-react, Framer Motion, Recharts  
- In-memory state via `lib/demo-store.ts` (resets on server restart)

## Future roadmap

- Live Auth0 Universal Login + session middleware  
- Real Token Vault API calls and connection mapping  
- Persistent audit store (append-only DB / event stream)  
- Plaid / bill-pay aggregator adapters behind the same vault abstraction  
- Optional LLM for natural language → structured intent (with policy guardrails)

## Hackathon pitch (30 seconds)

> VaultPilot is a **personal finance execution agent** that proves AI shouldn’t have unlimited authority over money. **Auth0** secures users; **Token Vault** holds provider tokens; **policies and risk scores** decide what runs automatically and what waits for **you**. Every step is **audited**. It’s **delegation with adult supervision** — ready for investors who care about **safe automation**.

---

*Screenshot placeholders: replace the image URL above with real captures from your demo.*
