import { NextResponse } from "next/server";
import {
  getApprovals,
  getAuditLog,
  getBills,
  getConnections,
  getDailySpend,
  getPolicy,
} from "@/lib/demo-store";

export async function GET() {
  return NextResponse.json({
    policy: getPolicy(),
    approvals: getApprovals(),
    audit: getAuditLog().slice(0, 50),
    bills: getBills(),
    connections: getConnections(),
    dailySpend: getDailySpend(),
  });
}
