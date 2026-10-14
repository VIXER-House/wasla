import "server-only";
import type { KeyMode } from "@prisma/client";
import { db } from "@/lib/db";
import { randomToken, sha256 } from "@/lib/crypto";
import { PLAN_BY_ID } from "@/lib/plans";

/** "wk_live_…" / "wk_test_…" — 40 random characters after the prefix. */
export async function createApiKey(accountId: string, name: string, mode: KeyMode) {
  const account = await db.account.findUniqueOrThrow({ where: { id: accountId } });
  const active = await db.apiKey.count({ where: { accountId, revokedAt: null } });
  const max = PLAN_BY_ID[account.plan].maxApiKeys;
  if (active >= max) return { ok: false as const, error: `Your ${PLAN_BY_ID[account.plan].name} plan allows ${max} active keys. Revoke one or upgrade.` };
  const key = `wk_${mode === "LIVE" ? "live" : "test"}_${randomToken(30)}`;
  const row = await db.apiKey.create({ data: { accountId, name: name.trim() || "Untitled key", mode, prefix: key.slice(0, 16), hash: sha256(key) } });
  return { ok: true as const, key, id: row.id };
}

export async function revokeApiKey(accountId: string, id: string) {
  await db.apiKey.updateMany({ where: { id, accountId, revokedAt: null }, data: { revokedAt: new Date() } });
}

export async function renameApiKey(accountId: string, id: string, name: string) {
  await db.apiKey.updateMany({ where: { id, accountId }, data: { name: name.trim().slice(0, 60) || "Untitled key" } });
}

/** Resolve a bearer token → active key + account (null if unknown/revoked). */
export async function findApiKey(token: string) {
  if (!/^wk_(live|test)_[A-Za-z0-9_-]{20,}$/.test(token)) return null;
  const key = await db.apiKey.findUnique({ where: { hash: sha256(token) }, include: { account: true } });
  if (!key || key.revokedAt) return null;
  // last-used is informational — don't block the request on it
  db.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } }).catch(() => null);
  return key;
}
