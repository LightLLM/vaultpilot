import { NextRequest, NextResponse } from "next/server";
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
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  const requestWithPath = new NextRequest(request.url, {
    headers: requestHeaders,
    method: request.method,
  });

  if (!auth0Configured()) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return getAuth0().middleware(requestWithPath);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
