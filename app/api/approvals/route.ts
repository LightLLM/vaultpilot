import { NextRequest, NextResponse } from "next/server";
import { approvePending, rejectPending } from "@/lib/agent";
import { requireApiUser } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const auth = await requireApiUser(req);
  if (auth instanceof NextResponse) return auth;

  const { id, action } = (await req.json()) as {
    id: string;
    action: "approve" | "reject";
  };
  if (!id || !action) {
    return NextResponse.json({ error: "id and action required" }, { status: 400 });
  }
  const res =
    action === "approve"
      ? approvePending(id, auth)
      : rejectPending(id, auth);
  return NextResponse.json(res);
}
