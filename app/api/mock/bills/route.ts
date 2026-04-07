import { NextResponse } from "next/server";
import { getBills } from "@/lib/demo-store";

export async function GET() {
  return NextResponse.json({ bills: getBills() });
}
