"use client";

import { useActionState, useState } from "react";
import { AlertTriangle, KeyRound } from "lucide-react";
import { createKeyAction, revokeKeyAction, type ActionState } from "../actions";
import { SubmitButton } from "@/components/auth-ui";
import { Card, CardHeader } from "@/components/ui/card";
import { Alert, Field, Input, Select } from "@/components/ui/form";
import { CopyText } from "@/components/code-block";

export function CreateKeyCard({ atLimit, limitText }: { atLimit: boolean; limitText: string }) {
  const [state, action] = useActionState<ActionState, FormData>(createKeyAction, {});
  return (
    <Card>
      <CardHeader title="Create a key" description={limitText} />
      <div className="p-5">
        {state.newKey && (
          <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
              <AlertTriangle className="h-4 w-4" /> Copy your key now — you won&apos;t see it again.
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <code className="min-w-0 flex-1 break-all rounded-lg border border-amber-200 bg-white px-3 py-2 font-mono text-[13px] text-ink-900" data-testid="new-key">{state.newKey}</code>
              <CopyText value={state.newKey} />
            </div>
          </div>
        )}
        {state.error && <Alert tone="error" className="mb-4">{state.error}</Alert>}
        <form action={action} className="grid gap-4 sm:grid-cols-[1fr_180px_auto] sm:items-end">
          <Field label="Name">
            <Input name="name" placeholder="e.g. Production server" maxLength={60} required disabled={atLimit} />
          </Field>
          <Field label="Mode">
            <Select name="mode" defaultValue="TEST" disabled={atLimit}>
              <option value="TEST">Test (free, simulated)</option>
              <option value="LIVE">Live (uses credits)</option>
            </Select>
          </Field>
          <SubmitButton className="sm:mb-0">
            <KeyRound className="h-4 w-4" /> Create key
          </SubmitButton>
        </form>
      </div>
    </Card>
  );
}

export function RevokeButton({ id, name }: { id: string; name: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <form
      action={async (fd) => {
        if (!window.confirm(`Revoke “${name}”? Apps using it will stop working immediately.`)) return;
        setBusy(true);
        await revokeKeyAction(fd);
        setBusy(false);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button disabled={busy} className="rounded-md px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50">
        {busy ? "Revoking…" : "Revoke"}
      </button>
    </form>
  );
}
