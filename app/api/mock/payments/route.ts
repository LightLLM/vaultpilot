import { NextRequest, NextResponse } from "next/server";
import { mockBilling } from "@/lib/mock-providers";
import { requireApiUser } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const gate = await requireApiUser(req);
  if (gate instanceof NextResponse) return gate;

  const { payee, amount } = (await req.json()) as {
    payee: string;
    amount: number;
  };
  const res = mockBilling.executePayment(payee, amount);
  return NextResponse.json(res);
}
