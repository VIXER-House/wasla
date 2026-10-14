import { z } from "zod";
import { parseJson, withApiKey } from "@/server/http/api";
import { aiCredits } from "@/lib/plans";
import { InsufficientCreditsError, spendCredits } from "@/server/services/credits.service";
import { generateReply, testReply } from "@/server/services/ai.service";
import { recordUsage } from "@/server/services/usage.service";

const Body = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(8000) })).min(1).max(40),
  instructions: z.string().max(4000).optional(),
  maxTokens: z.number().int().min(16).max(2048).optional(),
});

/**
 * POST /api/v1/ai/reply — the next WhatsApp-style reply for a conversation.
 * Billed by tokens: 1 credit per started 1,000 tokens. Test keys get a canned reply for free.
 */
export const POST = withApiKey(async (req, { account, key, test }) => {
  const body = await parseJson(req, Body);
  if (account.credits < 1 && !test) throw new InsufficientCreditsError(1, account.credits);
  const r = test ? testReply(body.messages) : await generateReply(body);
  const credits = test ? 0 : aiCredits(r.tokensIn + r.tokensOut);
  let balance = account.credits;
  if (credits) {
    // Charge what the call actually used; if the balance ran out meanwhile, take what is left
    balance = await spendCredits(account.id, credits, "AI reply").catch(async (e) => {
      if (!(e instanceof InsufficientCreditsError) || e.balance <= 0) throw e;
      return (await spendCredits(account.id, e.balance, "AI reply (partial)")) ?? 0;
    }) ?? balance;
  }
  await recordUsage({ accountId: account.id, apiKeyId: key.id, kind: "AI_REQUEST", mode: key.mode, credits, tokensIn: r.tokensIn, tokensOut: r.tokensOut, detail: r.model });
  return {
    reply: r.text,
    usage: { inputTokens: r.tokensIn, outputTokens: r.tokensOut, credits },
    creditsRemaining: balance,
    mode: key.mode.toLowerCase(),
  };
});
