/**
 * Authentication — Auth0 (MVP simulation)
 * =======================================
 * Production: use `@auth0/nextjs-auth0` or Auth0 Universal Login with App Router.
 * Sessions should be established server-side; API routes validate the session
 * before any delegated action. Token Vault operations always occur server-side.
 *
 * Insert Auth0 configuration here:
 * - AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_SECRET (session encryption)
 * - AUTH0_AUDIENCE if using APIs
 *
 * This demo uses a fixed sandbox user id for audit trails and UI labels.
 */

export const DEMO_USER = {
  id: "auth0|vaultpilot-demo",
  email: "demo@vaultpilot.local",
  name: "Demo User",
};

export function getCurrentUser() {
  // PRODUCTION: return session user from Auth0 SDK getSession()
  return DEMO_USER;
}

export function assertAuthenticated(): typeof DEMO_USER {
  const u = getCurrentUser();
  if (!u) throw new Error("Unauthorized");
  return u;
}
