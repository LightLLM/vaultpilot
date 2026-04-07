import { NextResponse } from "next/server";
import { approvePending, rejectPending } from "@/lib/agent";

export async function POST(req: Request) {
  const { id, action } = (await req.json()) as {
    id: string;
    action: "approve" | "reject";
  };
  if (!id || !action) {
    return NextResponse.json({ error: "id and action required" }, { status: 400 });
  }
  const res =
    action === "approve" ? approvePending(id) : rejectPending(id);
  return NextResponse.json(res);
}
