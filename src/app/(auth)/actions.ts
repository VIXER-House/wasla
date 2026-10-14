"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { endSession, getCurrentUser, startSession } from "@/lib/auth";
import { changePassword, confirmEmail, requestPasswordReset, resendVerification, resetPassword, signUp, verifyLogin } from "@/server/services/auth.service";

export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
  devLink?: string;
  email?: string;
}

const password = z.string().min(8, "Use at least 8 characters").max(200);
const email = z.string().trim().email("Enter a valid email address").max(200);

function fieldErrors(e: z.ZodError) {
  return Object.fromEntries(e.issues.map((i) => [String(i.path[0]), i.message]));
}

/** Only allow local redirects after login. */
function safeNext(v: FormDataEntryValue | null) {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/dashboard";
}

export async function signUpAction(_: FormState, form: FormData): Promise<FormState> {
  const parsed = z.object({ name: z.string().trim().min(2, "Enter your name").max(80), email, password }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  const r = await signUp(parsed.data);
  if (!r.ok) return { error: r.error };
  if (r.email.error) return { error: r.email.error };
  const q = new URLSearchParams({ email: parsed.data.email.toLowerCase(), sent: "1", ...(r.email.devLink ? { dev: r.email.devLink } : {}) });
  redirect(`/check-email?${q}`);
}

export async function resendVerificationAction(_: FormState, form: FormData): Promise<FormState> {
  const parsed = email.safeParse(form.get("email"));
  if (!parsed.success) return { error: "Enter a valid email address" };
  const r = await resendVerification(parsed.data);
  if (r?.error) return { error: r.error };
  return { message: "If that address has an unconfirmed account, a new confirmation email is on its way.", devLink: r?.devLink };
}

export async function confirmEmailAction(_: FormState, form: FormData): Promise<FormState> {
  const r = await confirmEmail(String(form.get("token") ?? ""));
  if (!r.ok) return { error: r.error };
  await startSession(r.userId);
  redirect("/dashboard?welcome=1");
}

export async function loginAction(_: FormState, form: FormData): Promise<FormState> {
  const parsed = z.object({ email, password: z.string().min(1, "Enter your password") }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), email: String(form.get("email") ?? "") };
  const user = await verifyLogin(parsed.data.email, parsed.data.password);
  if (!user) return { error: "Wrong email or password.", email: parsed.data.email };
  if (!user.emailVerifiedAt) return { error: "unverified", email: user.email };
  await startSession(user.id);
  redirect(safeNext(form.get("next")));
}

export async function logoutAction() {
  await endSession();
  redirect("/");
}

export async function forgotPasswordAction(_: FormState, form: FormData): Promise<FormState> {
  const parsed = email.safeParse(form.get("email"));
  if (!parsed.success) return { error: "Enter a valid email address" };
  const r = await requestPasswordReset(parsed.data);
  if (r?.error) return { error: r.error };
  return { message: "If an account exists for that address, we've emailed a link to reset the password. It expires in 1 hour.", devLink: r?.devLink };
}

export async function resetPasswordAction(_: FormState, form: FormData): Promise<FormState> {
  const parsed = z
    .object({ token: z.string().min(10), password, confirm: z.string() })
    .refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  const r = await resetPassword(parsed.data.token, parsed.data.password);
  if (!r.ok) return { error: r.error };
  await startSession(r.userId);
  redirect("/dashboard");
}

export async function changePasswordAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const parsed = z
    .object({ current: z.string().min(1, "Enter your current password"), password, confirm: z.string() })
    .refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  const r = await changePassword(user.id, parsed.data.current, parsed.data.password);
  return r.ok ? { message: "Password updated." } : { error: r.error };
}
