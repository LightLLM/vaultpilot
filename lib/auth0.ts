import { Auth0Client } from "@auth0/nextjs-auth0/server";

let client: Auth0Client | null = null;

/** Lazy singleton so `next build` and tests work without Auth0 env vars. */
export function getAuth0(): Auth0Client {
  if (!client) client = new Auth0Client();
  return client;
}
