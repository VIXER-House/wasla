"use client";

import { useActionState } from "react";
import type { Plan } from "@prisma/client";
import { adjustCreditsAction, setPlanAction, type AdminState } from "../../actions";
import { SubmitButton } from "@/components/auth-ui";
import { Alert, Field, Input, Select } from "@/components/ui/form";
import { PLANS } from "@/lib/plans";

export function CreditsForm({ accountId }: { accountId: string }) {
  const [state, action] = useActionState<AdminState, FormData>(adjustCreditsAction, {});
  return (
    <form action={action} className="space-y-3">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.message && <Alert tone="success">{state.message}</Alert>}
      <input type="hidden" name="accountId" value={accountId} />
      <Field label="Credits"><Input name="amount" inputMode="numeric" placeholder="e.g. 1000 or -200" required /></Field>
      <Field label="Reason"><Input name="reason" placeholder="e.g. Bank transfer #123, goodwill" /></Field>
      <SubmitButton>Apply</SubmitButton>
    </form>
  );
}

export function PlanForm({ accountId, plan }: { accountId: string; plan: Plan }) {
  const [state, action] = useActionState<AdminState, FormData>(setPlanAction, {});
  return (
    <form action={action} className="space-y-3">
      {state.message && <Alert tone="success">{state.message}</Alert>}
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <input type="hidden" name="accountId" value={accountId} />
      <Field label="Plan">
        <Select name="plan" defaultValue={plan}>
          {PLANS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
      </Field>
      <label className="flex items-center gap-2 text-sm text-ink-700">
        <input type="checkbox" name="grant" className="h-4 w-4 rounded border-ink-300" /> Also add this plan&apos;s monthly credits
      </label>
      <SubmitButton>Save plan</SubmitButton>
    </form>
  );
}
