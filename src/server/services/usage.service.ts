import "server-only";
import type { KeyMode, UsageKind } from "@prisma/client";
import { db } from "@/lib/db";

export async function recordUsage(input: {
  accountId: string;
  apiKeyId?: string | null;
  kind: UsageKind;
  mode: KeyMode;
  credits?: number;
  tokensIn?: number;
  tokensOut?: number;
  ok?: boolean;
  detail?: string | null;
}) {
  return db.usageEvent.create({
    data: {
      accountId: input.accountId,
      apiKeyId: input.apiKeyId ?? null,
      kind: input.kind,
      mode: input.mode,
      credits: input.credits ?? 0,
      tokensIn: input.tokensIn ?? 0,
      tokensOut: input.tokensOut ?? 0,
      ok: input.ok ?? true,
      detail: input.detail?.slice(0, 300) ?? null,
    },
  });
}

export interface DailyUsage {
  day: string; // YYYY-MM-DD
  messagesSent: number;
  messagesReceived: number;
  aiRequests: number;
  aiTokens: number;
  credits: number;
}

/** Per-day totals for the last `days` days (live + test, test spends no credits). */
export async function dailyUsage(accountId: string, days = 30): Promise<DailyUsage[]> {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (days - 1));
  const rows = await db.usageEvent.findMany({
    where: { accountId, createdAt: { gte: since } },
    select: { kind: true, credits: true, tokensIn: true, tokensOut: true, createdAt: true },
  });
  const out = new Map<string, DailyUsage>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since.getTime() + i * 86400_000).toISOString().slice(0, 10);
    out.set(d, { day: d, messagesSent: 0, messagesReceived: 0, aiRequests: 0, aiTokens: 0, credits: 0 });
  }
  for (const r of rows) {
    const u = out.get(r.createdAt.toISOString().slice(0, 10));
    if (!u) continue;
    u.credits += r.credits;
    if (r.kind === "MESSAGE_SENT") u.messagesSent++;
    else if (r.kind === "MESSAGE_RECEIVED") u.messagesReceived++;
    else {
      u.aiRequests++;
      u.aiTokens += r.tokensIn + r.tokensOut;
    }
  }
  return [...out.values()];
}

export function sumUsage(days: DailyUsage[]) {
  return days.reduce(
    (a, d) => ({
      messagesSent: a.messagesSent + d.messagesSent,
      messagesReceived: a.messagesReceived + d.messagesReceived,
      aiRequests: a.aiRequests + d.aiRequests,
      aiTokens: a.aiTokens + d.aiTokens,
      credits: a.credits + d.credits,
    }),
    { messagesSent: 0, messagesReceived: 0, aiRequests: 0, aiTokens: 0, credits: 0 },
  );
}
