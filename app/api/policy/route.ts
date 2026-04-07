import { NextResponse } from "next/server";
import { getPolicy, setPolicy } from "@/lib/demo-store";
import type { UserPolicy } from "@/lib/types";

export async function GET() {
  return NextResponse.json(getPolicy());
}

export async function POST(req: Request) {
  const body = (await req.json()) as UserPolicy;
  setPolicy(body);
  return NextResponse.json({ ok: true, policy: getPolicy() });
}
