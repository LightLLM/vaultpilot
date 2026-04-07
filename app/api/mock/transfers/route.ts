import { NextRequest, NextResponse } from "next/server";
import { mockBank } from "@/lib/mock-providers";
import { requireApiUser } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const gate = await requireApiUser(req);
  if (gate instanceof NextResponse) return gate;

  const { amount, destination } = (await req.json()) as {
    amount: number;
    destination: string;
  };
  const res = mockBank.createTransfer(amount, destination);
  return NextResponse.json(res);
}
