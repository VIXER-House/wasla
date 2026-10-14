"use client";

import { useActionState } from "react";
import { resetPasswordAction, type FormState } from "../actions";
import { AuthCard, SubmitButton } from "@/components/auth-ui";
import { Alert, Field, Input } from "@/components/ui/form";

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState<FormState, FormData>(resetPasswordAction, {});
  const fe = state.fieldErrors ?? {};
  return (
    <AuthCard title="Choose a new password">
      <form action={action} className="space-y-4" noValidate>
        {state.error && <Alert tone="error">{state.error}</Alert>}
        <input type="hidden" name="token" value={token} />
        <Field label="New password" error={fe.password} hint="At least 8 characters.">
          <Input name="password" type="password" autoComplete="new-password" required />
        </Field>
        <Field label="Confirm new password" error={fe.confirm}>
          <Input name="confirm" type="password" autoComplete="new-password" required />
        </Field>
        <SubmitButton className="w-full">Save and sign in</SubmitButton>
      </form>
    </AuthCard>
  );
}
