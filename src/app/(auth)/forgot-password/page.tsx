"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction, type FormState } from "../actions";
import { AuthCard, DevLink, SubmitButton } from "@/components/auth-ui";
import { Alert, Field, Input } from "@/components/ui/form";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState<FormState, FormData>(forgotPasswordAction, {});
  return (
    <AuthCard title="Reset your password" subtitle="We'll email you a link to choose a new one.">
      {state.message ? (
        <>
          <Alert tone="success">{state.message}</Alert>
          <DevLink href={state.devLink} />
        </>
      ) : (
        <form action={action} className="space-y-4" noValidate>
          {state.error && <Alert tone="error">{state.error}</Alert>}
          <Field label="Email">
            <Input name="email" type="email" autoComplete="email" required />
          </Field>
          <SubmitButton className="w-full">Send reset link</SubmitButton>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-ink-600">
        <Link href="/login" className="font-medium text-brand-700 hover:underline">Back to sign in</Link>
      </p>
    </AuthCard>
  );
}
