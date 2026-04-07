/**
 * Auth0 Token Vault — delegated third-party access (architecture layer)
 * ========================================================================
 * In production, this module is the ONLY place that exchanges Auth0 session
 * context for short-lived provider tokens via Auth0 Token Vault (or the
 * Auth0-managed secure token store for connected accounts).
 *
 * WHY NOT TOKENS IN THE FRONTEND?
 * - OAuth refresh/access tokens must never live in browser memory, localStorage,
 *   or React state — they are bearer credentials. Token Vault keeps them in a
 *   hardened vault; your app receives capability handles or server-side
 *   exchange results, not raw secrets.
 *
 * HOW DELEGATION IS MEDIATED
 * - User connects a provider through Auth0 (Hosted Login / Connections).
 * - Token Vault stores provider tokens scoped to the user + connection.
 * - Backend services call `getDelegatedAccess(provider)` to obtain a vault-backed
 *   session for API calls to MetroNet, bank aggregators, etc. — without the
 *   Next.js app ever persisting tokens in app code.
 *
 * INTEGRATION POINTS (replace mocks below):
 * - `GET /api/v2/token-vault/...` or Auth0 SDK methods per your tenant setup.
 * - Map `provider` string to Auth0 connection IDs / Resource Indicators.
 * - Rotate and revoke via Auth0 Dashboard + Vault APIs on disconnect.
 *
 * This MVP uses in-memory consent state in `lib/demo-store.ts` to simulate
 * vault-backed connections for demos and local development.
 */

import {
  disconnectProvider as storeDisconnect,
  getConnections,
  connectProvider as storeConnect,
  listProviderIds,
  updateConnection,
} from "@/lib/demo-store";
import type { ProviderConnection, ProviderId } from "@/lib/types";

export type DelegatedAccess = {
  provider: ProviderId;
  /** Simulated vault reference — production: opaque handle from Token Vault */
  vaultReference: string;
  expiresAt: string;
  scopes: string[];
};

export function getDelegatedAccess(provider: ProviderId): DelegatedAccess | null {
  const c = getConnections()[provider];
  if (!c.connected) return null;
  // PRODUCTION: exchange Auth0 session + connection for vault-sourced token or signed JWT
  return {
    provider,
    vaultReference: `vault_ref_${provider}_${Date.now()}`,
    expiresAt: new Date(Date.now() + 3600_000).toISOString(),
    scopes: c.scopes,
  };
}

export function getGrantedScopes(provider: ProviderId): string[] {
  return getConnections()[provider].scopes;
}

export function listConnectedProviders(): ProviderConnection[] {
  return listProviderIds().map((id) => ({ ...getConnections()[id] }));
}

export function revokeProvider(provider: ProviderId) {
  // PRODUCTION: call Auth0 Token Vault / Connections API to revoke refresh tokens
  storeDisconnect(provider);
}

export function connectMockProvider(provider: ProviderId) {
  storeConnect(provider);
}

export function isProviderConnected(provider: ProviderId): boolean {
  return getConnections()[provider].connected;
}

/** Narrow scope revoke — demo updates local store only */
export function revokeScope(provider: ProviderId, scope: string) {
  const c = getConnections()[provider];
  const next = c.scopes.filter((s) => s !== scope);
  updateConnection(provider, { scopes: next });
}
