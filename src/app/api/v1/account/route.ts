import { withApiKey } from "@/server/http/api";
import { PLAN_BY_ID } from "@/lib/plans";
import { isWhatsAppConnected } from "@/server/services/whatsapp.service";

/** GET /api/v1/account — plan, credit balance, connection status. */
export const GET = withApiKey(async (_req, { account, key }) => ({
  id: account.id,
  name: account.name,
  plan: account.plan,
  planName: PLAN_BY_ID[account.plan].name,
  planRenewsAt: account.planRenewsAt,
  credits: account.credits,
  whatsappConnected: isWhatsAppConnected(account),
  key: { name: key.name, mode: key.mode.toLowerCase() },
}));
