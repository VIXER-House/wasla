import "server-only";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { db } from "./db";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, readSession, signSession } from "./session";

export async function startSession(userId: string) {
  (await cookies()).set(SESSION_COOKIE, await signSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && !process.env.APP_URL?.startsWith("http://"),
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Signed-in user (with account), or null. Checked against the DB on every call. */
export async function getCurrentUser() {
  const uid = await readSession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!uid) return null;
  return db.user.findUnique({ where: { id: uid }, include: { account: true } });
}

/** Pages behind login: verified email + account required. */
export async function requireUser(next = "/dashboard") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (!user.emailVerifiedAt) redirect(`/check-email?email=${encodeURIComponent(user.email)}`);
  if (!user.account) redirect("/login");
  return user as typeof user & { account: NonNullable<typeof user.account> };
}

/**
 * Is this user an admin? While no admin exists yet, the earliest confirmed user is made admin
 * (the site owner, who signs up first) — no configuration needed.
 */
export async function isAdmin(user: { id: string; isAdmin: boolean; emailVerifiedAt: Date | null }) {
  if (user.isAdmin) return true;
  if (!user.emailVerifiedAt) return false;
  if (await db.user.count({ where: { isAdmin: true } })) return false;
  const first = await db.user.findFirst({ where: { emailVerifiedAt: { not: null } }, orderBy: { createdAt: "asc" }, select: { id: true } });
  if (first?.id !== user.id) return false;
  await db.user.update({ where: { id: user.id }, data: { isAdmin: true } });
  return true;
}

/** Admin pages: everyone else gets a 404. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!(await isAdmin(user))) notFound();
  return user;
}
