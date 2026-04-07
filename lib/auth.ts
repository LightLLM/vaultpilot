/**
 * Authentication — Auth0 (@auth0/nextjs-auth0) + demo fallback
 * ==============================================================
 * When `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, and `AUTH0_SECRET`
 * are set, sessions are real; otherwise the app uses `DEMO_USER` (local/hackathon).
 *
 * Login / logout: `<a href="/auth/login">` and `<a href="/auth/logout">` (SDK routes).
 * Register callback in Auth0: `{APP_BASE_URL}/auth/callback`
 */

import type { NextRequest } from "next/server";
import { getAuth0 } from "@/lib/auth0";

export type AppUser = {
  id: string;
  email: string;
  name: string;
};

export const DEMO_USER: AppUser = {
  id: "auth0|vaultpilot-demo",
  email: "demo@vaultpilot.local",
  name: "Demo User",
};

export function isAuth0Enabled(): boolean {
  return Boolean(
    process.env.AUTH0_SECRET?.trim() &&
      process.env.AUTH0_CLIENT_ID?.trim() &&
      process.env.AUTH0_CLIENT_SECRET?.trim() &&
      process.env.AUTH0_DOMAIN?.trim(),
  );
}

/**
 * Current user for this request. Demo mode always returns `DEMO_USER`.
 * With Auth0 enabled and no session, returns `null`.
 */
export async function getSessionUser(
  req?: NextRequest,
): Promise<AppUser | null> {
  if (!isAuth0Enabled()) {
    return DEMO_USER;
  }
  const auth0 = getAuth0();
  const session = req ? await auth0.getSession(req) : await auth0.getSession();
  const u = session?.user;
  if (!u?.sub) return null;
  return {
    id: u.sub,
    email: u.email ?? "",
    name: u.name ?? u.email ?? "User",
  };
}
