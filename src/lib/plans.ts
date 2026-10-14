import type { Plan } from "@prisma/client";

/**
 * Prices and credit rules — the single source for the pricing page, checkout and metering.
 * Amounts are monthly, in EGP. WhatsApp conversation fees are billed by Meta directly.
 */
export interface PlanInfo {
  id: Plan;
  name: string;
  priceEgp: number | null; // null = contact sales
  monthlyCredits: number;
  maxApiKeys: number;
  blurb: string;
  features: string[];
  highlight?: boolean;
}

export const PLANS: PlanInfo[] = [
  {
    id: "FREE",
    name: "Free",
    priceEgp: 0,
    monthlyCredits: 0,
    maxApiKeys: 2,
    blurb: "Try the API with test keys and a starter balance.",
    features: ["200 credits when you confirm your email", "Unlimited test-mode calls", "2 API keys", "Community support"],
  },
  {
    id: "STARTER",
    name: "Starter",
    priceEgp: 499,
    monthlyCredits: 5_000,
    maxApiKeys: 10,
    blurb: "For one product or branch going live on WhatsApp.",
    features: ["5,000 credits every month", "1 WhatsApp number", "AI replies in Arabic & English", "Webhooks for incoming messages", "Email support"],
  },
  {
    id: "GROWTH",
    name: "Growth",
    priceEgp: 1_499,
    monthlyCredits: 20_000,
    maxApiKeys: 25,
    blurb: "For busy teams with real daily volume.",
    features: ["20,000 credits every month", "Up to 3 WhatsApp numbers", "Voice-note transcription (soon)", "Usage analytics", "Priority support"],
    highlight: true,
  },
  {
    id: "BUSINESS",
    name: "Business",
    priceEgp: null,
    monthlyCredits: 0,
    maxApiKeys: 100,
    blurb: "Custom volume, SLAs and onboarding.",
    features: ["Custom credit volume", "Unlimited numbers", "Dedicated onboarding", "SLA & invoicing"],
  },
];

export const PLAN_BY_ID = Object.fromEntries(PLANS.map((p) => [p.id, p])) as Record<Plan, PlanInfo>;

export const TRIAL_CREDITS = 200;

/** One-off top-ups. */
export const CREDIT_PACKS = [
  { id: "pack-1k", credits: 1_000, priceEgp: 129 },
  { id: "pack-5k", credits: 5_000, priceEgp: 549 },
  { id: "pack-20k", credits: 20_000, priceEgp: 1_999 },
] as const;
export type CreditPack = (typeof CREDIT_PACKS)[number];

/** What things cost, in credits. Test-mode keys never spend credits. */
export const COSTS = {
  messageSent: 1,
  messageReceived: 0,
  /** AI: 1 credit per started 1,000 tokens (input + output) */
  aiPer1kTokens: 1,
} as const;

export function aiCredits(tokens: number) {
  return Math.max(1, Math.ceil(tokens / 1000)) * COSTS.aiPer1kTokens;
}
