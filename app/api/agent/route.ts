import { NextResponse } from "next/server";
import { runAgentCommand } from "@/lib/agent";

export async function POST(req: Request) {
  try {
    const { command } = (await req.json()) as { command: string };
    if (!command?.trim()) {
      return NextResponse.json(
        { error: "command is required" },
        { status: 400 },
      );
    }
    const result = runAgentCommand(command);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Agent error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
