import type { ParsedIntent } from "@/lib/types";

/**
 * Deterministic keyword parsing for reliable hackathon demos — no LLM.
 */
export function parseIntent(raw: string): ParsedIntent {
  const t = raw.trim().toLowerCase();

  if (/approval|waiting|pending/.test(t) && /show|list|what/.test(t)) {
    return { kind: "list_approvals", raw };
  }

  if (/pause|duplicate|subscription/.test(t)) {
    return { kind: "pause_subscriptions", raw };
  }

  const payMatch = t.match(
    /(?:pay|autopay).*(?:internet|bill|under).*\$?\s*(\d+)/,
  );
  if (payMatch || (/internet/.test(t) && /under\s*\$?\s*(\d+)/.test(t))) {
    const m = t.match(/under\s*\$?\s*(\d+)/);
    return {
      kind: "pay_bill_under",
      threshold: m ? Number(m[1]) : Number(payMatch?.[1] ?? 120),
      billKeyword: "internet",
      raw,
    };
  }

  if (/electric|powergrid|electricity/.test(t) && /\$?\s*(\d+)/.test(t)) {
    const m = t.match(/\$?\s*(\d+)/);
    return {
      kind: "pay_bill_under",
      threshold: 100,
      billKeyword: "electric",
      amount: m ? Number(m[1]) : 142,
      raw,
    };
  }

  const sav = t.match(
    /move\s*\$?\s*(\d+).*savings|savings.*\$?\s*(\d+)/,
  );
  if (sav) {
    const amount = Number(sav[1] || sav[2]);
    return { kind: "savings_transfer", amount, raw };
  }

  const ext = t.match(
    /transfer\s*\$?\s*([\d,]+)\s*(?:to\s*)?(?:a\s*)?(?:new\s*)?external/,
  );
  if (ext) {
    const amount = Number(ext[1].replace(/,/g, ""));
    return { kind: "external_transfer", amount, raw };
  }

  if (/new external|external account/.test(t) && /\$?\s*([\d,]+)/.test(t)) {
    const m = t.match(/\$?\s*([\d,]+)/);
    return {
      kind: "external_transfer",
      amount: m ? Number(m[1].replace(/,/g, "")) : 1200,
      raw,
    };
  }

  return { kind: "unknown", raw };
}
