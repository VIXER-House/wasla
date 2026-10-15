import { NextResponse, type NextRequest } from "next/server";
import { verifyMetaChallenge, verifyMetaSignature, parseMetaWebhook } from "@vixer-house/whatsapp-kit";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { forwardInbound } from "@/server/services/whatsapp.service";
import { recordUsage } from "@/server/services/usage.service";

/**
 * Meta WhatsApp webhook for one account. Set it as the Callback URL in the Meta app:
 *   GET  — verification handshake (hub.verify_token = the account's verify token)
 *   POST — messages + delivery receipts; signature checked with the account's app secret,
 *          then forwarded (signed) to the account's own webhook URL.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ accountId: string }> }) {
  const account = await db.account.findUnique({ where: { id: (await params).accountId } });
  const challenge = account?.waVerifyToken ? verifyMetaChallenge(req.nextUrl.searchParams, account.waVerifyToken) : null;
  return challenge === null ? new NextResponse("Forbidden", { status: 403 }) : new NextResponse(challenge);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ accountId: string }> }) {
  const accountId = (await params).accountId;
  const account = await db.account.findUnique({ where: { id: accountId } });
  console.log(`[wa-webhook] POST from Meta for account ${accountId} (found: ${!!account})`);
  if (!account) return new NextResponse("Not found", { status: 404 });
  const raw = await req.text();
  if (account.waAppSecretEnc && !verifyMetaSignature(raw, req.headers.get("x-hub-signature-256"), decrypt(account.waAppSecretEnc))) {
    console.warn("[wa-webhook] REJECTED: bad signature — App secret in Dashboard → WhatsApp doesn't match Meta's App secret");
    // Make the problem visible in the customer's Usage page instead of failing silently
    await recordUsage({ accountId: account.id, kind: "MESSAGE_RECEIVED", mode: "LIVE", ok: false, detail: "Webhook from Meta rejected: signature doesn't match the App secret saved in Dashboard → WhatsApp" });
    return new NextResponse("Bad signature", { status: 403 });
  }
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new NextResponse("Bad JSON", { status: 400 });
  }
  const { messages } = parseMetaWebhook(payload);
  const fwd = await forwardInbound(account, payload);
  console.log(`[wa-webhook] ${messages.length} message(s); forward to ${account.webhookUrl ?? "(no webhook URL set)"} →`, JSON.stringify(fwd));
  const why = fwd.forwarded ? "" : ` (not forwarded: ${"status" in fwd && fwd.status ? `your webhook answered HTTP ${fwd.status}` : "error" in fwd && fwd.error ? fwd.error : "webhook URL/secret not set"})`;
  for (const m of messages) {
    await recordUsage({ accountId: account.id, kind: "MESSAGE_RECEIVED", mode: "LIVE", ok: fwd.forwarded, detail: `from ${m.from}${why}` });
  }
  // Always 200 quickly so Meta doesn't retry
  return NextResponse.json({ ok: true });
}
