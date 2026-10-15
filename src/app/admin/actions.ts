"use server";

import { revalidatePath } from "next/cache";
import type { Plan } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { PLAN_BY_ID } from "@/lib/plans";
import * as admin from "@/server/services/admin.service";

export interface AdminState {
  error?: string;
  message?: string;
}

function refresh(accountId?: string) {
  revalidatePath("/admin", "layout");
  if (accountId) revalidatePath(`/admin/customers/${accountId}`);
}

export async function markPaidAction(form: FormData) {
  const me = await requireAdmin();
  await admin.markOrderPaid(me.email, String(form.get("orderId")));
  refresh();
}

export async function cancelOrderAction(form: FormData) {
  const me = await requireAdmin();
  await admin.cancelOrder(me.email, String(form.get("orderId")));
  refresh();
}

export async function adjustCreditsAction(_: AdminState, form: FormData): Promise<AdminState> {
  const me = await requireAdmin();
  const accountId = String(form.get("accountId"));
  const amount = Number(String(form.get("amount") ?? "").replace(/[,\s]/g, ""));
  const r = await admin.adjustCredits(me.email, accountId, amount, String(form.get("reason") ?? ""));
  refresh(accountId);
  return r.ok ? { message: `${amount > 0 ? "Added" : "Removed"} ${Math.abs(amount).toLocaleString("en-US")} credits.` } : { error: r.error };
}

export async function setPlanAction(_: AdminState, form: FormData): Promise<AdminState> {
  const me = await requireAdmin();
  const accountId = String(form.get("accountId"));
  const plan = String(form.get("plan")) as Plan;
  if (!PLAN_BY_ID[plan]) return { error: "Unknown plan." };
  await admin.setPlan(me.email, accountId, plan, form.get("grant") === "on");
  refresh(accountId);
  return { message: `Plan set to ${PLAN_BY_ID[plan].name}.` };
}

export async function blockAction(form: FormData) {
  const me = await requireAdmin();
  const accountId = String(form.get("accountId"));
  await admin.setBlocked(me.email, accountId, form.get("block") === "1", String(form.get("reason") ?? ""));
  refresh(accountId);
}

export async function setAdminAction(form: FormData) {
  const me = await requireAdmin();
  const accountId = String(form.get("accountId"));
  await admin.setUserAdmin(me.email, String(form.get("userId")), form.get("admin") === "1");
  refresh(accountId);
}

export async function revokeKeysAction(form: FormData) {
  const me = await requireAdmin();
  const accountId = String(form.get("accountId"));
  await admin.revokeAllKeys(me.email, accountId);
  refresh(accountId);
}
