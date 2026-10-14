import { withApiKey } from "@/server/http/api";
import { dailyUsage, sumUsage } from "@/server/services/usage.service";

/** GET /api/v1/usage?days=30 — per-day usage and totals. */
export const GET = withApiKey(async (req, { account }) => {
  const days = Math.min(90, Math.max(1, Number(req.nextUrl.searchParams.get("days") ?? 30) || 30));
  const daily = await dailyUsage(account.id, days);
  return { days, totals: sumUsage(daily), daily, creditsRemaining: account.credits };
});
