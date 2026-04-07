import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAuth0 } from "./lib/auth0";

function auth0Configured(): boolean {
  return Boolean(
    process.env.AUTH0_SECRET?.trim() &&
      process.env.AUTH0_CLIENT_ID?.trim() &&
      process.env.AUTH0_CLIENT_SECRET?.trim() &&
      process.env.AUTH0_DOMAIN?.trim(),
  );
}

export async function middleware(request: NextRequest) {
  if (!auth0Configured()) {
    return NextResponse.next();
  }
  return getAuth0().middleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
