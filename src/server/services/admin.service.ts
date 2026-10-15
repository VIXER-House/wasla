import "server-only";
import type { Plan, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { PLAN_BY_ID } from "@/lib/plans";
import { fulfilOrder } from "./checkout.service";
import { grantCredits, spendCredits } from "./credits.service";

async function log(adminEmail: string, action: string, accountId: string | null, detail: string) {
  await db.adminLog.create({ data: { adminEmail, action, accountId, detail: detail.slice(0, 500) } }).catch((e) => console.error("[admin] log failed", e));
}

const monthStart = () => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
};

export async function adminStats() {
  const since = monthStart();
  const [customers, newCustomers, unverified, paidPlans, pendingOrders, revenue, usage, credits] = await Promise.all([
    db.user.count({ where: { emailVerifiedAt: { not: null } } }),
    db.user.count({ where: { emailVerifiedAt: { not: null }, createdAt: { gte: since } } }),
    db.user.count({ where: { emailVerifiedAt: null } }),
    db.account.groupBy({ by: ["plan"], _count: { _all: true }, where: { plan: { not: "FREE" } } }),
    db.order.count({ where: { status: "PENDING" } }),
    db.order.aggregate({ where: { status: "PAID", paidAt: { gte: since } }, _sum: { amountEgp: true } }),
    db.usageEvent.groupBy({ by: ["kind"], where: { createdAt: { gte: since }, mode: "LIVE" }, _count: { _all: true }, _sum: { tokensIn: true, tokensOut: true, credits: true } }),
    db.account.aggregate({ _sum: { credits: true } }),
  ]);
  const byKind = Object.fromEntries(usage.map((u) => [u.kind, u]));
  return {
    customers,
    newCustomers,
    unverified,
    paidPlans: paidPlans.map((p) => ({ plan: p.plan, count: p._count._all })),
    paidTotal: paidPlans.reduce((s, p) => s + p._count._all, 0),
    pendingOrders,
    revenueEgp: revenue._sum.amountEgp ?? 0,
    messagesSent: byKind.MESSAGE_SENT?._count._all ?? 0,
    messagesReceived: byKind.MESSAGE_RECEIVED?._count._all ?? 0,
    aiRequests: byKind.AI_REQUEST?._count._all ?? 0,
    aiTokens: (byKind.AI_REQUEST?._sum.tokensIn ?? 0) + (byKind.AI_REQUEST?._sum.tokensOut ?? 0),
    creditsUsed: usage.reduce((s, u) => s + (u._sum.credits ?? 0), 0),
    creditsOutstanding: credits._sum.credits ?? 0,
  };
}

export async function listCustomers(params: { q?: string; filter?: string; page?: number }) {
  const take = 25;
  const page = Math.max(1, params.page ?? 1);
  const q = params.q?.trim();
  const where: Prisma.AccountWhereInput = {
    ...(q ? { OR: [{ owner: { email: { contains: q, mode: "insensitive" } } }, { owner: { name: { contains: q, mode: "insensitive" } } }, { name: { contains: q, mode: "insensitive" } }] } : {}),
    ...(params.filter === "paid" ? { plan: { not: "FREE" } } : params.filter === "blocked" ? { blockedAt: { not: null } } : params.filter === "unverified" ? { owner: { emailVerifiedAt: null } } : {}),
  };
  const [rows, total] = await Promise.all([
    db.account.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
      include: { owner: { select: { email: true, name: true, emailVerifiedAt: true } }, _count: { select: { apiKeys: { where: { revokedAt: null } }, usage: true } } },
    }),
    db.account.count({ where }),
  ]);
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / take)) };
}

export async function getCustomer(accountId: string) {
  const account = await db.account.findUnique({
    where: { id: accountId },
    include: {
      owner: { select: { id: true, email: true, name: true, emailVerifiedAt: true, createdAt: true, isAdmin: true } },
      apiKeys: { orderBy: { createdAt: "desc" } },
      orders: { orderBy: { createdAt: "desc" }, take: 20 },
      transactions: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!account) return null;
  const [usage30, logs] = await Promise.all([
    db.usageEvent.groupBy({ by: ["kind"], where: { accountId, createdAt: { gte: new Date(Date.now() - 30 * 86400_000) } }, _count: { _all: true }, _sum: { credits: true, tokensIn: true, tokensOut: true } }),
    db.adminLog.findMany({ where: { accountId }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  return { account, usage30, logs };
}

export async function listOrders(status: "PENDING" | "PAID" | "CANCELLED" | "ALL") {
  return db.order.findMany({
    where: status === "ALL" ? {} : { status },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { account: { select: { id: true, name: true, owner: { select: { email: true, name: true } } } } },
  });
}

// ───────────────────────── actions ─────────────────────────

export async function markOrderPaid(admin: string, orderId: string) {
  const order = await fulfilOrder(orderId);
  if (!order) return { ok: false as const, error: "This order is no longer pending." };
  await log(admin, "order.paid", order.accountId, `Marked ${order.item} (${order.amountEgp} EGP) as paid`);
  return { ok: true as const };
}

export async function cancelOrder(admin: string, orderId: string) {
  const r = await db.order.updateMany({ where: { id: orderId, status: "PENDING" }, data: { status: "CANCELLED" } });
  if (!r.count) return { ok: false as const, error: "This order is no longer pending." };
  const order = await db.order.findUniqueOrThrow({ where: { id: orderId } });
  await log(admin, "order.cancelled", order.accountId, `Cancelled ${order.item}`);
  return { ok: true as const };
}

export async function adjustCredits(admin: string, accountId: string, amount: number, reason: string) {
  if (!Number.isInteger(amount) || amount === 0 || Math.abs(amount) > 10_000_000) return { ok: false as const, error: "Enter a whole number of credits (positive to add, negative to remove)." };
  const why = reason.trim() || (amount > 0 ? "Added by admin" : "Removed by admin");
  if (amount > 0) await grantCredits(accountId, amount, `Admin: ${why}`);
  else {
    try {
      await spendCredits(accountId, -amount, `Admin: ${why}`);
    } catch {
      return { ok: false as const, error: "The account doesn't have that many credits." };
    }
  }
  await log(admin, "credits.adjust", accountId, `${amount > 0 ? "+" : ""}${amount} credits — ${why}`);
  return { ok: true as const };
}

export async function setPlan(admin: string, accountId: string, plan: Plan, grantMonthly: boolean) {
  const info = PLAN_BY_ID[plan];
  await db.account.update({ where: { id: accountId }, data: { plan, planRenewsAt: plan === "FREE" ? null : new Date(Date.now() + 30 * 86400_000) } });
  if (grantMonthly && info.monthlyCredits > 0) await grantCredits(accountId, info.monthlyCredits, `Admin: ${info.name} plan — monthly credits`);
  await log(admin, "plan.set", accountId, `Plan set to ${info.name}${grantMonthly && info.monthlyCredits ? ` (+${info.monthlyCredits} credits)` : ""}`);
  return { ok: true as const };
}

export async function setBlocked(admin: string, accountId: string, blocked: boolean, reason?: string) {
  await db.account.update({ where: { id: accountId }, data: blocked ? { blockedAt: new Date(), blockedReason: reason?.trim() || null } : { blockedAt: null, blockedReason: null } });
  await log(admin, blocked ? "account.blocked" : "account.unblocked", accountId, blocked ? `Blocked${reason ? `: ${reason}` : ""}` : "Unblocked");
  return { ok: true as const };
}

export async function revokeAllKeys(admin: string, accountId: string) {
  const r = await db.apiKey.updateMany({ where: { accountId, revokedAt: null }, data: { revokedAt: new Date() } });
  await log(admin, "keys.revoked", accountId, `Revoked ${r.count} API key(s)`);
  return { ok: true as const, count: r.count };
}

export async function setUserAdmin(admin: string, userId: string, makeAdmin: boolean) {
  if (!makeAdmin && (await db.user.count({ where: { isAdmin: true } })) <= 1) return { ok: false as const, error: "You can't remove the last admin." };
  const u = await db.user.update({ where: { id: userId }, data: { isAdmin: makeAdmin }, include: { account: { select: { id: true } } } });
  await log(admin, makeAdmin ? "admin.granted" : "admin.revoked", u.account?.id ?? null, `${makeAdmin ? "Made" : "Removed"} ${u.email} ${makeAdmin ? "an admin" : "as admin"}`);
  return { ok: true as const };
}

export async function recentAdminLogs() {
  return db.adminLog.findMany({ orderBy: { createdAt: "desc" }, take: 15 });
}
