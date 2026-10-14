"use client";

import { useActionState } from "react";
import { updateProfileAction, type ActionState } from "../actions";
import { changePasswordAction, type FormState } from "@/app/(auth)/actions";
import { SubmitButton } from "@/components/auth-ui";
import { Alert, Field, Input } from "@/components/ui/form";

export function ProfileForm({ name, workspace, email }: { name: string; workspace: string; email: string }) {
  const [state, action] = useActionState<ActionState, FormData>(updateProfileAction, {});
  return (
    <form action={action} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.message && <Alert tone="success">{state.message}</Alert>}
      <Field label="Your name"><Input name="name" defaultValue={name} /></Field>
      <Field label="Workspace name"><Input name="workspace" defaultValue={workspace} /></Field>
      <Field label="Email" hint="Contact support to change your email."><Input value={email} disabled readOnly /></Field>
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(changePasswordAction, {});
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.message && <Alert tone="success">{state.message}</Alert>}
      <Field label="Current password" error={fe.current}><Input name="current" type="password" autoComplete="current-password" /></Field>
      <Field label="New password" error={fe.password} hint="At least 8 characters."><Input name="password" type="password" autoComplete="new-password" /></Field>
      <Field label="Confirm new password" error={fe.confirm}><Input name="confirm" type="password" autoComplete="new-password" /></Field>
      <SubmitButton>Update password</SubmitButton>
    </form>
  );
}
