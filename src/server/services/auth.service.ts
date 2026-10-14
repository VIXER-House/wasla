import "server-only";
import bcrypt from "bcryptjs";
import type { EmailTokenType } from "@prisma/client";
import { db } from "@/lib/db";
import { appUrl } from "@/lib/config";
import { randomToken, sha256 } from "@/lib/crypto";
import { sendPasswordResetEmail, sendVerificationEmail, type EmailResult } from "@/lib/email";
import { grantCredits } from "./credits.service";
import { TRIAL_CREDITS } from "@/lib/plans";

const TTL: Record<EmailTokenType, number> = { VERIFY_EMAIL: 24 * 3600_000, RESET_PASSWORD: 3600_000 };
const DUMMY_HASH = bcrypt.hashSync("timing-equalization", 10);

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

async function issueToken(userId: string, type: EmailTokenType) {
  const token = randomToken(32);
  // Older unused links of the same kind stop working
  await db.emailToken.updateMany({ where: { userId, type, usedAt: null }, data: { usedAt: new Date() } });
  await db.emailToken.create({ data: { userId, type, tokenHash: sha256(token), expiresAt: new Date(Date.now() + TTL[type]) } });
  return token;
}

/** Valid, unused, unexpired token → its row. */
async function findToken(token: string, type: EmailTokenType) {
  const row = await db.emailToken.findUnique({ where: { tokenHash: sha256(token) }, include: { user: true } });
  if (!row || row.type !== type || row.usedAt || row.expiresAt < new Date()) return null;
  return row;
}

export async function signUp(input: { name: string; email: string; password: string }): Promise<{ ok: true; email: EmailResult } | { ok: false; error: string }> {
  const email = normalizeEmail(input.email);
  const existing = await db.user.findUnique({ where: { email } });
  if (existing?.emailVerifiedAt) return { ok: false, error: "An account with this email already exists. Sign in instead." };
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = existing
    ? await db.user.update({ where: { id: existing.id }, data: { name: input.name.trim(), passwordHash } }) // unconfirmed sign-up again
    : await db.user.create({ data: { email, name: input.name.trim(), passwordHash, account: { create: { name: `${input.name.trim()}'s workspace` } } } });
  if (existing && !(await db.account.findUnique({ where: { ownerId: user.id } }))) {
    await db.account.create({ data: { ownerId: user.id, name: `${user.name}'s workspace` } });
  }
  const token = await issueToken(user.id, "VERIFY_EMAIL");
  return { ok: true, email: await sendVerificationEmail(user.email, user.name, appUrl(`/verify-email?token=${token}`)) };
}

export async function resendVerification(emailRaw: string): Promise<EmailResult | null> {
  const user = await db.user.findUnique({ where: { email: normalizeEmail(emailRaw) } });
  if (!user || user.emailVerifiedAt) return null; // don't reveal whether the address exists
  const recent = await db.emailToken.findFirst({ where: { userId: user.id, type: "VERIFY_EMAIL", createdAt: { gt: new Date(Date.now() - 60_000) } } });
  if (recent) return { sent: false, error: "Please wait a minute before asking for another email." };
  const token = await issueToken(user.id, "VERIFY_EMAIL");
  return sendVerificationEmail(user.email, user.name, appUrl(`/verify-email?token=${token}`));
}

/** Confirms the address and grants the one-time trial credits. Returns the user id to sign in. */
export async function confirmEmail(token: string): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const row = await findToken(token, "VERIFY_EMAIL");
  if (!row) return { ok: false, error: "This confirmation link is invalid or has expired." };
  const claimed = await db.emailToken.updateMany({ where: { id: row.id, usedAt: null }, data: { usedAt: new Date() } });
  if (!claimed.count) return { ok: false, error: "This confirmation link was already used." };
  if (!row.user.emailVerifiedAt) {
    await db.user.update({ where: { id: row.userId }, data: { emailVerifiedAt: new Date() } });
    const account = await db.account.findUnique({ where: { ownerId: row.userId } });
    if (account) await grantCredits(account.id, TRIAL_CREDITS, "Welcome credits");
  }
  return { ok: true, userId: row.userId };
}

export async function verifyLogin(emailRaw: string, password: string) {
  const user = await db.user.findUnique({ where: { email: normalizeEmail(emailRaw) } });
  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    return null;
  }
  return (await bcrypt.compare(password, user.passwordHash)) ? user : null;
}

export async function requestPasswordReset(emailRaw: string): Promise<EmailResult | null> {
  const user = await db.user.findUnique({ where: { email: normalizeEmail(emailRaw) } });
  if (!user) return null;
  const token = await issueToken(user.id, "RESET_PASSWORD");
  return sendPasswordResetEmail(user.email, appUrl(`/reset-password?token=${token}`));
}

export async function checkResetToken(token: string) {
  return !!(await findToken(token, "RESET_PASSWORD"));
}

export async function resetPassword(token: string, password: string): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const row = await findToken(token, "RESET_PASSWORD");
  if (!row) return { ok: false, error: "This reset link is invalid or has expired. Ask for a new one." };
  const claimed = await db.emailToken.updateMany({ where: { id: row.id, usedAt: null }, data: { usedAt: new Date() } });
  if (!claimed.count) return { ok: false, error: "This reset link was already used." };
  // Opening the reset link from the email also proves the address
  await db.user.update({ where: { id: row.userId }, data: { passwordHash: await bcrypt.hash(password, 10), emailVerifiedAt: row.user.emailVerifiedAt ?? new Date() } });
  if (!row.user.emailVerifiedAt) {
    const account = await db.account.findUnique({ where: { ownerId: row.userId } });
    if (account) await grantCredits(account.id, TRIAL_CREDITS, "Welcome credits");
  }
  return { ok: true, userId: row.userId };
}

export async function changePassword(userId: string, current: string, next: string) {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  if (!(await bcrypt.compare(current, user.passwordHash))) return { ok: false as const, error: "Your current password is not correct." };
  await db.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(next, 10) } });
  return { ok: true as const };
}
