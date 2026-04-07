import { NextResponse } from "next/server";
import { mockBilling } from "@/lib/mock-providers";

export async function POST(req: Request) {
  const { payee, amount } = (await req.json()) as {
    payee: string;
    amount: number;
  };
  const res = mockBilling.executePayment(payee, amount);
  return NextResponse.json(res);
}
