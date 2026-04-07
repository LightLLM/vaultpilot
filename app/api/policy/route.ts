import { NextRequest, NextResponse } from "next/server";
import { getPolicy, setPolicy } from "@/lib/demo-store";
import type { UserPolicy } from "@/lib/types";
import { requireApiUser } from "@/lib/api-auth";

export async function GET() {
  return NextResponse.json(getPolicy());
}

export async function POST(req: NextRequest) {
  const gate = await requireApiUser(req);
  if (gate instanceof NextResponse) return gate;

  const body = (await req.json()) as UserPolicy;
  setPolicy(body);
  return NextResponse.json({ ok: true, policy: getPolicy() });
}
