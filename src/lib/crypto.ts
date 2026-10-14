import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { getConfig } from "./config";

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

/** URL-safe random token (email links, API keys, secrets). */
export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

function key() {
  return createHash("sha256").update(getConfig().ENCRYPTION_KEY).digest();
}

/** AES-256-GCM, stored as base64url "iv.tag.ciphertext". */
export function encrypt(plain: string) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return [iv, c.getAuthTag(), enc].map((b) => b.toString("base64url")).join(".");
}

export function decrypt(stored: string) {
  const [iv, tag, enc] = stored.split(".").map((p) => Buffer.from(p, "base64url"));
  const d = createDecipheriv("aes-256-gcm", key(), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(enc), d.final()]).toString("utf8");
}
