import { NextResponse } from "next/server";
import { DEMO_USER, getSessionUser, isAuth0Enabled } from "@/lib/auth";

export async function GET() {
  const auth0Enabled = isAuth0Enabled();
  if (!auth0Enabled) {
    return NextResponse.json({
      auth0Enabled: false,
      signedIn: true,
      email: DEMO_USER.email,
    });
  }
  const user = await getSessionUser();
  return NextResponse.json({
    auth0Enabled: true,
    signedIn: Boolean(user),
    email: user?.email ?? null,
  });
}
