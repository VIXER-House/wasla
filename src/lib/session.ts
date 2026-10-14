import { SignJWT, jwtVerify } from "jose";

/** Edge-safe session token helpers (middleware + server). */
export const SESSION_COOKIE = "wasla_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

function secret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET || "insecure-dev-secret-change-me-0123456789abcdef");
}

export async function signSession(userId: string) {
  return new SignJWT({ uid: userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(`${SESSION_TTL_SECONDS}s`).sign(secret());
}

export async function readSession(token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.uid === "string" ? payload.uid : null;
  } catch {
    return null;
  }
}
