import { z } from "zod";

const bool = z
  .string()
  .optional()
  .transform((v) => v === "1" || v === "true");

const schema = z.object({
  NODE_ENV: z.string().default("development"),
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(16).default("insecure-dev-secret-change-me-0123456789abcdef"),
  ENCRYPTION_KEY: z.string().min(16).default("insecure-dev-encryption-key-0123456789abcdef"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Wasla <onboarding@resend.dev>"),
  EMAIL_DEV_LINKS: bool,
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-flash-latest"),
  CHECKOUT_TEST_MODE: bool,
});

export type AppConfig = z.infer<typeof schema>;
let cached: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (cached) return cached;
  const parsed = schema.parse(Object.fromEntries(Object.entries(process.env).map(([k, v]) => [k, v === "" ? undefined : v])));
  if (parsed.NODE_ENV === "production" && parsed.AUTH_SECRET.startsWith("insecure-dev")) console.warn("[config] AUTH_SECRET is not set — set it in production!");
  cached = parsed;
  return cached;
}

/** Absolute URL on this site (emails, webhook addresses). */
export function appUrl(path = "/") {
  return `${getConfig().APP_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
