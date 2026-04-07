import { NextRequest, NextResponse } from "next/server";
import {
  connectMockProvider,
  revokeProvider,
} from "@/lib/token-vault";
import type { ProviderId } from "@/lib/types";
import { requireApiUser } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const gate = await requireApiUser(req);
  if (gate instanceof NextResponse) return gate;

  const { provider, action } = (await req.json()) as {
    provider: ProviderId;
    action: "connect" | "revoke";
  };
  if (!provider || !action) {
    return NextResponse.json(
      { error: "provider and action required" },
      { status: 400 },
    );
  }
  if (action === "connect") connectMockProvider(provider);
  else revokeProvider(provider);
  return NextResponse.json({ ok: true });
}
