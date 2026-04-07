import { NextResponse } from "next/server";
import { mockBank } from "@/lib/mock-providers";

export async function POST(req: Request) {
  const { amount, destination } = (await req.json()) as {
    amount: number;
    destination: string;
  };
  const res = mockBank.createTransfer(amount, destination);
  return NextResponse.json(res);
}
