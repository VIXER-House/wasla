"use client";

import Link from "next/link";
import { useActionState } from "react";
import { confirmEmailAction, type FormState } from "../actions";
import { AuthCard, SubmitButton } from "@/components/auth-ui";
import { Alert } from "@/components/ui/form";

export function VerifyEmail({ token }: { token: string }) {
  const [state, action] = useActionState<FormState, FormData>(confirmEmailAction, {});
  if (!token) {
    return (
      <AuthCard title="Link incomplete">
        <Alert tone="error">This confirmation link is missing its code. Open the link from the email again.</Alert>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Confirm your email" subtitle="One click and your account is ready.">
      <form action={action} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        {state.error && (
          <Alert tone="error">
            {state.error} <Link href="/check-email" className="font-medium underline">Get a new link</Link>
          </Alert>
        )}
        <SubmitButton className="w-full">Confirm my email</SubmitButton>
      </form>
    </AuthCard>
  );
}
