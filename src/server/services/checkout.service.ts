import "server-only";
import type { Plan } from "@prisma/client";
import { db } from "@/lib/db";
import { CREDIT_PACKS, PLAN_BY_ID } from "@/lib/plans";
import { grantCredits } from "./credits.service";

export type CheckoutItem = { kind: "plan"; plan: Plan; name: string; priceEgp: number; credits: number } | { kind: "pack"; id: string; name: string; priceEgp: number; credits: number };

export function resolveItem(params: { plan?: string; pack?: string }): CheckoutItem | null {
  if (params.plan) {
    const p = PLAN_BY_ID[params.plan.toUpperCase() as Plan];
    if (!p || p.priceEgp === null || p.priceEgp === 0) return null;
    return { kind: "plan", plan: p.id, name: `${p.name} plan — monthly`, priceEgp: p.priceEgp, credits: p.monthlyCredits };
  }
  const pack = CREDIT_PACKS.find((c) => c.id === params.pack);
  return pack ? { kind: "pack", id: pack.id, name: `${pack.credits.toLocaleString("en-US")} credits`, priceEgp: pack.priceEgp, credits: pack.credits } : null;
}

export async function createOrder(accountId: string, item: CheckoutItem) {
  return db.order.create({
    data: { accountId, item: item.name, plan: item.kind === "plan" ? item.plan : null, credits: item.credits, amountEgp: item.priceEgp },
  });
}

/** Mark paid and deliver: a plan sets the plan + renewal date and grants its monthly credits. */
export async function fulfilOrder(orderId: string) {
  const claimed = await db.order.updateMany({ where: { id: orderId, status: "PENDING" }, data: { status: "PAID", paidAt: new Date() } });
  if (!claimed.count) return null;
  const order = await db.order.findUniqueOrThrow({ where: { id: orderId } });
  if (order.plan) {
    await db.account.update({ where: { id: order.accountId }, data: { plan: order.plan, planRenewsAt: new Date(Date.now() + 30 * 86400_000) } });
  }
  if (order.credits > 0) await grantCredits(order.accountId, order.credits, order.plan ? `${PLAN_BY_ID[order.plan].name} plan — monthly credits` : `Top-up: ${order.item}`);
  return order;
}
