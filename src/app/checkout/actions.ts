"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getConfig } from "@/lib/config";
import { db } from "@/lib/db";
import { createOrder, fulfilOrder, resolveItem } from "@/server/services/checkout.service";

/** Static checkout: records the order as pending (we follow up), or — in test mode — pays it instantly. */
export async function placeOrderAction(form: FormData) {
  const user = await requireUser("/checkout");
  const item = resolveItem({ plan: String(form.get("plan") ?? "") || undefined, pack: String(form.get("pack") ?? "") || undefined });
  if (!item) redirect("/pricing");
  const order = await createOrder(user.account.id, item);
  if (form.get("simulate") === "1" && getConfig().CHECKOUT_TEST_MODE) {
    await fulfilOrder(order.id);
    redirect(`/checkout/done?order=${order.id}`);
  }
  redirect(`/checkout/done?order=${order.id}`);
}

export async function getOrder(orderId: string, accountId: string) {
  return db.order.findFirst({ where: { id: orderId, accountId } });
}
