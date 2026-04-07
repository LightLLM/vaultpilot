import { NextRequest, NextResponse } from "next/server";
import { runAgentCommand } from "@/lib/agent";
import { requireApiUser } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiUser(req);
    if (auth instanceof NextResponse) return auth;

    const { command } = (await req.json()) as { command: string };
    if (!command?.trim()) {
      return NextResponse.json(
        { error: "command is required" },
        { status: 400 },
      );
    }
    const result = runAgentCommand(command, auth);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Agent error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
