"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { encrypt, randomToken } from "@/lib/crypto";
import { createApiKey, renameApiKey, revokeApiKey } from "@/server/services/api-keys.service";

export interface ActionState {
  error?: string;
  message?: string;
  newKey?: string;
  secret?: string;
}

export async function createKeyAction(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const name = String(form.get("name") ?? "").trim().slice(0, 60);
  const mode = form.get("mode") === "TEST" ? "TEST" : "LIVE";
  const r = await createApiKey(user.account.id, name, mode);
  if (!r.ok) return { error: r.error };
  revalidatePath("/dashboard/api-keys");
  return { newKey: r.key };
}

export async function revokeKeyAction(form: FormData) {
  const user = await requireUser();
  await revokeApiKey(user.account.id, String(form.get("id")));
  revalidatePath("/dashboard/api-keys");
}

export async function renameKeyAction(form: FormData) {
  const user = await requireUser();
  await renameApiKey(user.account.id, String(form.get("id")), String(form.get("name") ?? ""));
  revalidatePath("/dashboard/api-keys");
}

const WhatsAppForm = z.object({
  phoneNumberId: z.string().trim().regex(/^\d{6,25}$/, "The Phone number ID is a long number from Meta (WhatsApp → API Setup)."),
  accessToken: z.string().trim().optional(),
  appSecret: z.string().trim().optional(),
});

export async function saveWhatsAppAction(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = WhatsAppForm.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const a = user.account;
  const { phoneNumberId, accessToken, appSecret } = parsed.data;
  if (!accessToken && !a.waAccessTokenEnc) return { error: "Paste the permanent access token from Meta." };
  await db.account.update({
    where: { id: a.id },
    data: {
      waPhoneNumberId: phoneNumberId,
      // Empty fields keep the stored secret
      ...(accessToken ? { waAccessTokenEnc: encrypt(accessToken) } : {}),
      ...(appSecret ? { waAppSecretEnc: encrypt(appSecret) } : {}),
      waVerifyToken: a.waVerifyToken ?? randomToken(18),
    },
  });
  revalidatePath("/dashboard/whatsapp");
  return { message: "WhatsApp connection saved." };
}

export async function disconnectWhatsAppAction() {
  const user = await requireUser();
  await db.account.update({ where: { id: user.account.id }, data: { waPhoneNumberId: null, waAccessTokenEnc: null, waAppSecretEnc: null } });
  revalidatePath("/dashboard/whatsapp");
}

export async function saveWebhookAction(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const raw = String(form.get("webhookUrl") ?? "").trim();
  if (raw) {
    const ok = z.string().url().safeParse(raw).success && /^https:\/\//.test(raw);
    if (!ok && !/^http:\/\/localhost/.test(raw)) return { error: "Use a full https:// URL." };
  }
  const a = user.account;
  const fresh = !a.webhookSecret && raw;
  await db.account.update({ where: { id: a.id }, data: { webhookUrl: raw || null, webhookSecret: a.webhookSecret ?? (raw ? `whsec_${randomToken(24)}` : null) } });
  revalidatePath("/dashboard/whatsapp");
  return { message: raw ? (fresh ? "Webhook saved — copy your signing secret below." : "Webhook saved.") : "Webhook removed." };
}

export async function rotateWebhookSecretAction(_: ActionState): Promise<ActionState> {
  const user = await requireUser();
  const secret = `whsec_${randomToken(24)}`;
  await db.account.update({ where: { id: user.account.id }, data: { webhookSecret: secret } });
  revalidatePath("/dashboard/whatsapp");
  return { message: "New signing secret created. Update it on your server.", secret };
}

export async function updateProfileAction(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const name = String(form.get("name") ?? "").trim();
  const workspace = String(form.get("workspace") ?? "").trim();
  if (name.length < 2 || workspace.length < 2) return { error: "Names need at least 2 characters." };
  await db.user.update({ where: { id: user.id }, data: { name: name.slice(0, 80) } });
  await db.account.update({ where: { id: user.account.id }, data: { name: workspace.slice(0, 80) } });
  revalidatePath("/dashboard", "layout");
  return { message: "Saved." };
}
