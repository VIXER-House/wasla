import { z } from "zod";
import { isE164, normalizePhone } from "@vixer-house/whatsapp-kit";
import { ApiError, parseJson, withApiKey } from "@/server/http/api";
import { COSTS } from "@/lib/plans";
import { refundCredits, spendCredits } from "@/server/services/credits.service";
import { recordUsage } from "@/server/services/usage.service";
import { sendTemplate, sendText } from "@/server/services/whatsapp.service";

const Body = z
  .object({
    to: z.string().min(6).max(20),
    text: z.string().trim().min(1).max(4096).optional(),
    template: z.object({ name: z.string().min(1), language: z.string().default("ar"), params: z.array(z.string()).max(20).default([]) }).optional(),
  })
  .refine((b) => !!b.text !== !!b.template, { message: "Send either `text` or `template`." });

/** POST /api/v1/messages — send a WhatsApp message. 1 credit (free with test keys). */
export const POST = withApiKey(async (req, { account, key, test }) => {
  const body = await parseJson(req, Body);
  const to = normalizePhone(body.to);
  if (!isE164(to)) throw new ApiError(400, "invalid_phone", "`to` must be a phone number in international format, e.g. +201001234567.");
  const cost = test ? 0 : COSTS.messageSent;
  const balance = await spendCredits(account.id, cost, "Message sent");
  let result;
  try {
    result = body.template ? await sendTemplate(account, to, body.template, test) : await sendText(account, to, body.text!, test);
  } catch (e) {
    await refundCredits(account.id, cost, "message not sent");
    throw e;
  }
  const ok = result.status !== "FAILED";
  if (!ok) await refundCredits(account.id, cost, "message not sent");
  await recordUsage({ accountId: account.id, apiKeyId: key.id, kind: "MESSAGE_SENT", mode: key.mode, credits: ok ? cost : 0, ok, detail: ok ? `to ${to}` : result.error });
  if (!ok) throw new ApiError(502, "whatsapp_error", result.error ?? "WhatsApp rejected the message.");
  return { id: result.providerMessageId, status: result.status.toLowerCase(), to, mode: key.mode.toLowerCase(), creditsUsed: cost, creditsRemaining: balance ?? account.credits };
});
