/** End-to-end service + API tests against a real Postgres (skipped when no database is reachable). */
import http from "node:http";
import { createHmac } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { confirmEmail, signUp, verifyLogin, requestPasswordReset, resetPassword } from "@/server/services/auth.service";
import { createApiKey, findApiKey, revokeApiKey } from "@/server/services/api-keys.service";
import { spendCredits, InsufficientCreditsError } from "@/server/services/credits.service";
import { createOrder, fulfilOrder, resolveItem } from "@/server/services/checkout.service";
import { dailyUsage, sumUsage } from "@/server/services/usage.service";
import { TRIAL_CREDITS } from "@/lib/plans";
import { POST as sendMessage } from "@/app/api/v1/messages/route";
import { GET as getAccount } from "@/app/api/v1/account/route";
import { POST as aiReply } from "@/app/api/v1/ai/reply/route";
import { GET as webhookGet, POST as webhookPost } from "@/app/api/v1/webhooks/whatsapp/[accountId]/route";

let dbUp = false;
const email = `test+${Date.now()}@example.com`;
let accountId = "";
let testKey = "";
let liveKey = "";

beforeAll(async () => {
  try {
    await db.$queryRaw`SELECT 1`;
    dbUp = true;
  } catch {
    dbUp = false;
  }
});
afterAll(async () => {
  if (dbUp) await db.user.deleteMany({ where: { email } });
  await db.$disconnect();
});

const call = (handler: (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>, key: string, body?: unknown, method = "POST") =>
  handler(new NextRequest("http://localhost/api/v1/x", { method, headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined }), { params: Promise.resolve({}) });

describe.runIf(process.env.DATABASE_URL)("platform", () => {
  it("sign-up → email link → confirm grants the welcome credits once", async () => {
    if (!dbUp) return;
    const r = await signUp({ name: "Test Owner", email, password: "secret-123" });
    expect(r.ok).toBe(true);
    const link = r.ok ? r.email.devLink! : "";
    expect(link).toContain("/verify-email?token=");
    const token = new URL(link).searchParams.get("token")!;
    expect(await verifyLogin(email, "secret-123")).toBeTruthy();
    expect((await verifyLogin(email, "secret-123"))?.emailVerifiedAt).toBeNull();

    const c = await confirmEmail(token);
    expect(c.ok).toBe(true);
    expect((await confirmEmail(token)).ok).toBe(false); // single use
    const user = await db.user.findUniqueOrThrow({ where: { email }, include: { account: true } });
    expect(user.emailVerifiedAt).not.toBeNull();
    expect(user.account!.credits).toBe(TRIAL_CREDITS);
    accountId = user.account!.id;
    expect(await signUp({ name: "Again", email, password: "secret-123" })).toMatchObject({ ok: false });
  });

  it("password reset", async () => {
    if (!dbUp) return;
    const r = await requestPasswordReset(email);
    const token = new URL(r!.devLink!).searchParams.get("token")!;
    expect((await resetPassword(token, "new-secret-456")).ok).toBe(true);
    expect(await verifyLogin(email, "new-secret-456")).toBeTruthy();
    expect(await verifyLogin(email, "secret-123")).toBeNull();
  });

  it("API keys: created once, stored hashed, revocable", async () => {
    if (!dbUp) return;
    const t = await createApiKey(accountId, "Test", "TEST");
    const l = await createApiKey(accountId, "Live", "LIVE");
    expect(t.ok && l.ok).toBe(true);
    testKey = t.ok ? t.key : "";
    liveKey = l.ok ? l.key : "";
    expect(testKey).toMatch(/^wk_test_/);
    expect(await db.apiKey.count({ where: { hash: testKey } })).toBe(0);
    expect((await findApiKey(testKey))?.mode).toBe("TEST");
    // FREE plan: 2 keys max
    expect((await createApiKey(accountId, "Third", "TEST")).ok).toBe(false);
  });

  it("GET /account and auth errors", async () => {
    if (!dbUp) return;
    const ok = await call(getAccount, testKey, undefined, "GET");
    expect(ok.status).toBe(200);
    expect(await ok.json()).toMatchObject({ credits: TRIAL_CREDITS, plan: "FREE", whatsappConnected: false, key: { mode: "test" } });
    expect((await call(getAccount, "wk_live_nope_nope_nope_nope_nope_nope", undefined, "GET")).status).toBe(401);
  });

  it("POST /messages: test key is free; live key without WhatsApp → 409 and no charge; bad phone → 400", async () => {
    if (!dbUp) return;
    const t = await call(sendMessage, testKey, { to: "+201001234567", text: "hi" });
    expect(t.status).toBe(200);
    expect(await t.json()).toMatchObject({ status: "sent", creditsUsed: 0, mode: "test" });

    const l = await call(sendMessage, liveKey, { to: "+201001234567", text: "hi" });
    expect(l.status).toBe(409);
    expect((await l.json()).error.code).toBe("whatsapp_not_connected");
    expect((await db.account.findUniqueOrThrow({ where: { id: accountId } })).credits).toBe(TRIAL_CREDITS);

    const bad = await call(sendMessage, testKey, { to: "123", text: "hi" });
    expect(bad.status).toBe(400);
    const both = await call(sendMessage, testKey, { to: "+201001234567" });
    expect((await both.json()).error.code).toBe("invalid_request");
  });

  it("POST /ai/reply with a test key", async () => {
    if (!dbUp) return;
    const r = await call(aiReply, testKey, { messages: [{ role: "user", content: "عايز احجز ترابيزة" }] });
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.reply).toContain("وضع الاختبار");
    expect(j.usage.credits).toBe(0);
    // live key without GEMINI_API_KEY → 503
    expect((await call(aiReply, liveKey, { messages: [{ role: "user", content: "hi" }] })).status).toBe(503);
  });

  it("credits never go negative", async () => {
    if (!dbUp) return;
    await expect(spendCredits(accountId, 10_000, "too much")).rejects.toBeInstanceOf(InsufficientCreditsError);
    const results = await Promise.allSettled(Array.from({ length: 5 }, () => spendCredits(accountId, 50, "parallel")));
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(4); // 200 credits / 50
    expect((await db.account.findUniqueOrThrow({ where: { id: accountId } })).credits).toBe(0);
    const l = await call(sendMessage, liveKey, { to: "+201001234567", text: "hi" });
    expect(l.status).toBe(402);
  });

  it("checkout (test mode): plan order grants credits + plan, only once", async () => {
    if (!dbUp) return;
    const item = resolveItem({ plan: "starter" })!;
    const order = await createOrder(accountId, item);
    await fulfilOrder(order.id);
    await fulfilOrder(order.id);
    const a = await db.account.findUniqueOrThrow({ where: { id: accountId } });
    expect(a.plan).toBe("STARTER");
    expect(a.credits).toBe(5_000);
    expect(resolveItem({ plan: "business" })).toBeNull();
    expect(resolveItem({ pack: "pack-1k" })?.credits).toBe(1_000);
  });

  it("Meta webhook: verify handshake, signature check, signed forwarding, usage recorded", async () => {
    if (!dbUp) return;
    const received: { sig: string; body: string }[] = [];
    const server = http.createServer((req, res) => {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        received.push({ sig: String(req.headers["x-wasla-signature"]), body });
        res.end("ok");
      });
    });
    await new Promise<void>((r) => server.listen(0, r));
    const port = (server.address() as { port: number }).port;
    await db.account.update({
      where: { id: accountId },
      data: { waPhoneNumberId: "123456789", waAccessTokenEnc: encrypt("token"), waAppSecretEnc: encrypt("appsecret"), waVerifyToken: "vt-123", webhookUrl: `http://localhost:${port}/hook`, webhookSecret: "whsec_test" },
    });
    const params = Promise.resolve({ accountId });
    const hs = await webhookGet(new NextRequest(`http://localhost/x?hub.mode=subscribe&hub.verify_token=vt-123&hub.challenge=42`), { params });
    expect(await hs.text()).toBe("42");

    const payload = JSON.stringify({ object: "whatsapp_business_account", entry: [{ changes: [{ value: { messages: [{ id: "wamid.T1", from: "201001234567", timestamp: "1760000000", type: "text", text: { body: "مرحبا" } }] } }] }] });
    const bad = await webhookPost(new NextRequest("http://localhost/x", { method: "POST", body: payload, headers: { "x-hub-signature-256": "sha256=00" } }), { params });
    expect(bad.status).toBe(403);
    const sig = `sha256=${createHmac("sha256", "appsecret").update(payload).digest("hex")}`;
    const good = await webhookPost(new NextRequest("http://localhost/x", { method: "POST", body: payload, headers: { "x-hub-signature-256": sig } }), { params });
    expect(good.status).toBe(200);
    server.close();
    expect(received).toHaveLength(1);
    expect(received[0].sig).toBe(`sha256=${createHmac("sha256", "whsec_test").update(received[0].body).digest("hex")}`);
    expect(JSON.parse(received[0].body).messages[0]).toMatchObject({ from: "+201001234567", text: "مرحبا" });

    const t = sumUsage(await dailyUsage(accountId, 1));
    expect(t.messagesReceived).toBe(1);
    expect(t.messagesSent).toBeGreaterThanOrEqual(1);
  });

  it("revoked keys stop working", async () => {
    if (!dbUp) return;
    const k = await db.apiKey.findFirstOrThrow({ where: { accountId, mode: "TEST" } });
    await revokeApiKey(accountId, k.id);
    expect((await call(getAccount, testKey, undefined, "GET")).status).toBe(401);
  });
});

describe.runIf(process.env.DATABASE_URL)("admin", () => {
  it("credits, plan, block and order actions — logged", async () => {
    if (!dbUp) return;
    const admin = await import("@/server/services/admin.service");
    const u = await db.user.create({ data: { email: `adm+${Date.now()}@example.com`, name: "Adm Test", passwordHash: "x", emailVerifiedAt: new Date(), account: { create: { name: "W" } } }, include: { account: true } });
    const id = u.account!.id;
    try {
      expect((await admin.adjustCredits("boss@x.com", id, 500, "goodwill")).ok).toBe(true);
      expect((await admin.adjustCredits("boss@x.com", id, -600, "too much")).ok).toBe(false);
      expect((await admin.adjustCredits("boss@x.com", id, -100, "fix")).ok).toBe(true);
      expect((await db.account.findUniqueOrThrow({ where: { id } })).credits).toBe(400);

      await admin.setPlan("boss@x.com", id, "GROWTH", true);
      const a = await db.account.findUniqueOrThrow({ where: { id } });
      expect(a.plan).toBe("GROWTH");
      expect(a.credits).toBe(20_400);

      const k = await createApiKey(id, "k", "TEST");
      await admin.setBlocked("boss@x.com", id, true, "abuse");
      const r = await call(getAccount, k.ok ? k.key : "", undefined, "GET");
      expect(r.status).toBe(403);
      expect((await r.json()).error.code).toBe("account_blocked");
      await admin.setBlocked("boss@x.com", id, false);
      expect((await call(getAccount, k.ok ? k.key : "", undefined, "GET")).status).toBe(200);
      expect((await admin.revokeAllKeys("boss@x.com", id)).count).toBe(1);

      const order = await createOrder(id, resolveItem({ pack: "pack-1k" })!);
      expect((await admin.markOrderPaid("boss@x.com", order.id)).ok).toBe(true);
      expect((await admin.markOrderPaid("boss@x.com", order.id)).ok).toBe(false);
      const order2 = await createOrder(id, resolveItem({ pack: "pack-1k" })!);
      expect((await admin.cancelOrder("boss@x.com", order2.id)).ok).toBe(true);
      expect((await db.account.findUniqueOrThrow({ where: { id } })).credits).toBe(21_400);

      expect(await db.adminLog.count({ where: { accountId: id } })).toBe(8);
      const stats = await admin.adminStats();
      expect(stats.customers).toBeGreaterThan(0);
    } finally {
      await db.adminLog.deleteMany({ where: { accountId: id } });
      await db.user.delete({ where: { id: u.id } });
    }
  });

  it("first confirmed user becomes admin; admins can't remove the last admin", async () => {
    if (!dbUp) return;
    const { isAdmin } = await import("@/lib/auth");
    const admin = await import("@/server/services/admin.service");
    const existing = await db.user.findMany({ where: { isAdmin: true }, select: { id: true } });
    await db.user.updateMany({ where: { isAdmin: true }, data: { isAdmin: false } });
    try {
      const all = await db.user.findMany({ where: { emailVerifiedAt: { not: null } }, orderBy: { createdAt: "asc" } });
      if (all.length < 2) return;
      expect(await isAdmin(all[1])).toBe(false); // not the first
      expect(await isAdmin(all[0])).toBe(true); // first confirmed → promoted
      expect(await isAdmin({ ...all[1], isAdmin: false })).toBe(false); // an admin exists now
      expect((await admin.setUserAdmin("x", all[0].id, false)).ok).toBe(false);
      expect((await admin.setUserAdmin("x", all[1].id, true)).ok).toBe(true);
      expect((await admin.setUserAdmin("x", all[1].id, false)).ok).toBe(true);
    } finally {
      await db.user.updateMany({ where: { isAdmin: true }, data: { isAdmin: false } });
      if (existing.length) await db.user.updateMany({ where: { id: { in: existing.map((e) => e.id) } }, data: { isAdmin: true } });
    }
  });
});
