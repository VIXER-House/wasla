import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
