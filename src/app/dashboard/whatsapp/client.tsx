"use client";

import { useActionState, useState } from "react";
import { disconnectWhatsAppAction, rotateWebhookSecretAction, saveWebhookAction, saveWhatsAppAction, type ActionState } from "../actions";
import { SubmitButton } from "@/components/auth-ui";
import { Alert, Field, Input } from "@/components/ui/form";
import { CopyText } from "@/components/code-block";

export function ConnectionForm({ phoneNumberId, hasToken, hasSecret }: { phoneNumberId: string; hasToken: boolean; hasSecret: boolean }) {
  const [state, action] = useActionState<ActionState, FormData>(saveWhatsAppAction, {});
  return (
    <form action={action} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.message && <Alert tone="success">{state.message}</Alert>}
      <Field label="Phone number ID">
        <Input name="phoneNumberId" defaultValue={phoneNumberId} inputMode="numeric" placeholder="e.g. 109876543210987" required />
      </Field>
      <Field label="Permanent access token" hint={hasToken ? "Saved (encrypted). Leave empty to keep it." : "A System User token with whatsapp_business_messaging permission."}>
        <Input name="accessToken" type="password" placeholder={hasToken ? "••••••••••••" : "EAAG…"} autoComplete="off" />
      </Field>
      <Field label="App secret (recommended)" hint={hasSecret ? "Saved (encrypted). Leave empty to keep it." : "Meta app → Settings → Basic. Used to verify webhook signatures."}>
        <Input name="appSecret" type="password" placeholder={hasSecret ? "••••••••••••" : ""} autoComplete="off" />
      </Field>
      <SubmitButton>Save connection</SubmitButton>
    </form>
  );
}

export function DisconnectButton() {
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="mt-4 border-t border-ink-100 pt-4"
      action={async () => {
        if (!window.confirm("Disconnect this WhatsApp number? Live sends will fail until you connect again.")) return;
        setBusy(true);
        await disconnectWhatsAppAction();
        setBusy(false);
      }}
    >
      <button disabled={busy} className="text-sm font-medium text-red-700 hover:underline disabled:opacity-50">Disconnect number</button>
    </form>
  );
}

export function WebhookForm({ webhookUrl, secret }: { webhookUrl: string; secret: string | null }) {
  const [state, action] = useActionState<ActionState, FormData>(saveWebhookAction, {});
  const [rot, rotate] = useActionState<ActionState>(rotateWebhookSecretAction, {});
  const [show, setShow] = useState(false);
  const current = rot.secret ?? secret;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form action={action} className="space-y-4">
        {state.error && <Alert tone="error">{state.error}</Alert>}
        {state.message && <Alert tone="success">{state.message}</Alert>}
        <Field label="Your webhook URL" hint="Must answer within 8 seconds with any 2xx status.">
          <Input name="webhookUrl" type="url" defaultValue={webhookUrl} placeholder="https://your-app.com/webhooks/wasla" />
        </Field>
        <SubmitButton>Save webhook</SubmitButton>
      </form>
      <div className="text-sm">
        <div className="mb-1 font-medium text-ink-800">Signing secret</div>
        {current ? (
          <>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 break-all rounded-lg bg-ink-50 px-3 py-2 font-mono text-xs">{show ? current : "whsec_" + "•".repeat(24)}</code>
              <button type="button" onClick={() => setShow((s) => !s)} className="rounded-md border border-ink-200 px-2 py-1 text-xs hover:bg-ink-50">{show ? "Hide" : "Show"}</button>
              <CopyText value={current} />
            </div>
            {rot.message && <Alert tone="success" className="mt-3">{rot.message}</Alert>}
            <form action={rotate} className="mt-3">
              <button className="text-xs font-medium text-ink-600 underline hover:text-ink-900">Create a new secret</button>
            </form>
          </>
        ) : (
          <p className="text-ink-500">Save a webhook URL to get a secret.</p>
        )}
        <p className="mt-3 text-xs leading-5 text-ink-500">
          Each request has an <code className="rounded bg-ink-100 px-1">X-Wasla-Signature: sha256=…</code> header — the HMAC-SHA256 of the raw body with this secret. See the docs for verification code.
        </p>
      </div>
    </div>
  );
}
