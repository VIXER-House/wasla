"use client";

import Link from "next/link";
import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { resendVerificationAction, type FormState } from "../actions";
import { AuthCard, DevLink, SubmitButton } from "@/components/auth-ui";
import { Alert, Input } from "@/components/ui/form";

export function CheckEmail({ email, justSent, devLink }: { email: string; justSent: boolean; devLink?: string }) {
  const [state, action] = useActionState<FormState, FormData>(resendVerificationAction, {});
  return (
    <AuthCard title="Check your inbox">
      <div className="flex gap-3">
        <MailCheck className="mt-0.5 h-6 w-6 shrink-0 text-brand-600" />
        <p className="text-sm leading-6 text-ink-600">
          {justSent ? "We sent a confirmation link to " : "Confirm your email address to continue. We sent a link to "}
          <strong className="text-ink-900">{email || "your email"}</strong>. Click it to activate your account — it expires in 24 hours.
        </p>
      </div>
      <DevLink href={state.devLink ?? devLink} />
      <form action={action} className="mt-6 space-y-3 border-t border-ink-100 pt-5">
        <p className="text-sm text-ink-600">Didn&apos;t get it? Check spam, or send it again:</p>
        {state.error && <Alert tone="error">{state.error}</Alert>}
        {state.message && <Alert tone="success">{state.message}</Alert>}
        <div className="flex gap-2">
          <Input name="email" type="email" defaultValue={email} required />
          <SubmitButton variant="outline" className="shrink-0">Resend</SubmitButton>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-ink-600">
        Wrong address? <Link href="/signup" className="font-medium text-brand-700 hover:underline">Sign up again</Link>
      </p>
    </AuthCard>
  );
}
