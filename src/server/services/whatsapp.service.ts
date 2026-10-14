import "server-only";
import type { Account } from "@prisma/client";
import { MetaWhatsAppProvider, MockWhatsAppProvider, parseMetaWebhook, signPayload, type SendResult } from "@vixer-house/whatsapp-kit";
import { decrypt } from "@/lib/crypto";

export class WhatsAppNotConnectedError extends Error {
  constructor() {
    super("No WhatsApp number is connected to this account yet. Connect one in Dashboard → WhatsApp, or use a test key.");
  }
}

const testProvider = new MockWhatsAppProvider();

export function isWhatsAppConnected(a: Pick<Account, "waPhoneNumberId" | "waAccessTokenEnc">) {
  return !!(a.waPhoneNumberId && a.waAccessTokenEnc);
}

/** The account's own WhatsApp Cloud API number (official Meta API). */
export function providerFor(account: Account) {
  if (!isWhatsAppConnected(account)) throw new WhatsAppNotConnectedError();
  return new MetaWhatsAppProvider({
    token: decrypt(account.waAccessTokenEnc!),
    phoneNumberId: account.waPhoneNumberId!,
    appSecret: account.waAppSecretEnc ? decrypt(account.waAppSecretEnc) : undefined,
  });
}

export async function sendText(account: Account, to: string, text: string, test: boolean): Promise<SendResult> {
  return test ? testProvider.sendMessage(to, text) : providerFor(account).sendMessage(to, text);
}

export async function sendTemplate(account: Account, to: string, t: { name: string; language: string; params: string[] }, test: boolean): Promise<SendResult> {
  return test ? testProvider.sendTemplate(to, t.name, t.language, t.params) : providerFor(account).sendTemplate(to, t.name, t.language, t.params);
}

/**
 * Forward incoming WhatsApp messages to the customer's webhook, signed with their webhook secret:
 *   X-Wasla-Signature: sha256=<hex HMAC of the raw body>
 */
export async function forwardInbound(account: Account, payload: unknown) {
  const { messages, statuses } = parseMetaWebhook(payload);
  if (!account.webhookUrl || !account.webhookSecret || (!messages.length && !statuses.length)) return { forwarded: false, messages: messages.length };
  const body = JSON.stringify({
    type: "whatsapp.events",
    accountId: account.id,
    messages: messages.map((m) => ({ ...m, media: m.media ? { id: m.media.id, mimeType: m.media.mimeType, caption: m.media.caption, fileName: m.media.fileName } : undefined })),
    statuses,
  });
  try {
    const res = await fetch(account.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Wasla-Signature": signPayload(body, account.webhookSecret), "User-Agent": "Wasla-Webhooks/1.0" },
      body,
      signal: AbortSignal.timeout(8_000),
    });
    return { forwarded: res.ok, status: res.status, messages: messages.length };
  } catch (e) {
    return { forwarded: false, error: (e as Error).message, messages: messages.length };
  }
}
