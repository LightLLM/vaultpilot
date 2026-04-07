import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, isAuth0Enabled, type AppUser } from "@/lib/auth";

/**
 * When Auth0 is configured, require a session for mutating API routes.
 * Demo mode (no Auth0 env) always uses the sandbox user from `getSessionUser`.
 */
export async function requireApiUser(
  req: NextRequest,
): Promise<AppUser | NextResponse> {
  const user = await getSessionUser(req);
  if (isAuth0Enabled() && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user!;
}
