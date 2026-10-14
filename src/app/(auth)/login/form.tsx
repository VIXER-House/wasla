"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type FormState } from "../actions";
import { AuthCard, SubmitButton } from "@/components/auth-ui";
import { Alert, Field, Input } from "@/components/ui/form";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState<FormState, FormData>(loginAction, {});
  const fe = state.fieldErrors ?? {};
  return (
    <AuthCard title="Welcome back" subtitle="Sign in to manage your API keys, usage and credits.">
      <form action={action} className="space-y-4" noValidate>
        {state.error === "unverified" ? (
          <Alert tone="warning">
            Please confirm your email first.{" "}
            <Link href={`/check-email?email=${encodeURIComponent(state.email ?? "")}`} className="font-medium underline">Resend the confirmation email</Link>
          </Alert>
        ) : state.error ? (
          <Alert tone="error">{state.error}</Alert>
        ) : null}
        <input type="hidden" name="next" value={next} />
        <Field label="Email" error={fe.email}>
          <Input name="email" type="email" autoComplete="email" defaultValue={state.email} required />
        </Field>
        <Field label="Password" error={fe.password}>
          <Input name="password" type="password" autoComplete="current-password" required />
        </Field>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-brand-700 hover:underline">Forgot password?</Link>
        </div>
        <SubmitButton className="w-full">Sign in</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-ink-600">
        New here? <Link href="/signup" className="font-medium text-brand-700 hover:underline">Create an account</Link>
      </p>
    </AuthCard>
  );
}
