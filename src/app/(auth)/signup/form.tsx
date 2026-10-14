"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction, type FormState } from "../actions";
import { AuthCard, SubmitButton } from "@/components/auth-ui";
import { Alert, Field, Input } from "@/components/ui/form";
import { TRIAL_CREDITS } from "@/lib/plans";

export function SignupForm() {
  const [state, action] = useActionState<FormState, FormData>(signUpAction, {});
  const fe = state.fieldErrors ?? {};
  return (
    <AuthCard title="Create your account" subtitle={`Free to start — ${TRIAL_CREDITS} credits after you confirm your email.`}>
      <form action={action} className="space-y-4" noValidate>
        {state.error && <Alert tone="error">{state.error}</Alert>}
        <Field label="Your name" error={fe.name}>
          <Input name="name" autoComplete="name" required />
        </Field>
        <Field label="Work email" error={fe.email}>
          <Input name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Password" error={fe.password} hint="At least 8 characters.">
          <Input name="password" type="password" autoComplete="new-password" required minLength={8} />
        </Field>
        <SubmitButton className="w-full">Create account</SubmitButton>
        <p className="text-center text-xs text-ink-500">By creating an account you agree to use the service lawfully and to WhatsApp&apos;s Business Policy.</p>
      </form>
      <p className="mt-6 text-center text-sm text-ink-600">
        Already have an account? <Link href="/login" className="font-medium text-brand-700 hover:underline">Sign in</Link>
      </p>
    </AuthCard>
  );
}
