import { requireUser } from "@/lib/auth";
import { appUrl } from "@/lib/config";
import { isWhatsAppConnected } from "@/server/services/whatsapp.service";
import { PageTitle } from "@/components/dashboard/page-title";
import { Badge, Card, CardHeader } from "@/components/ui/card";
import { CopyText } from "@/components/code-block";
import { ConnectionForm, DisconnectButton, WebhookForm } from "./client";

export default async function WhatsAppPage() {
  const user = await requireUser();
  const a = user.account;
  const connected = isWhatsAppConnected(a);
  const callback = appUrl(`/api/v1/webhooks/whatsapp/${a.id}`);
  return (
    <>
      <PageTitle title="WhatsApp" description="Connect a number from the official WhatsApp Business Platform (Meta Cloud API)." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="1. Your WhatsApp number"
            description="From Meta for Developers → your app → WhatsApp → API Setup."
            actions={connected ? <Badge tone="green">connected</Badge> : <Badge tone="amber">not connected</Badge>}
          />
          <div className="p-5">
            <ConnectionForm phoneNumberId={a.waPhoneNumberId ?? ""} hasToken={!!a.waAccessTokenEnc} hasSecret={!!a.waAppSecretEnc} />
            {connected && <DisconnectButton />}
          </div>
        </Card>
        <Card>
          <CardHeader title="2. Meta webhook settings" description="In your Meta app → WhatsApp → Configuration → Webhook, enter these and subscribe to “messages”." />
          <div className="space-y-4 p-5 text-sm">
            <div>
              <div className="mb-1 font-medium text-ink-800">Callback URL</div>
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 break-all rounded-lg bg-ink-50 px-3 py-2 font-mono text-xs">{callback}</code>
                <CopyText value={callback} />
              </div>
            </div>
            <div>
              <div className="mb-1 font-medium text-ink-800">Verify token</div>
              {a.waVerifyToken ? (
                <div className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 break-all rounded-lg bg-ink-50 px-3 py-2 font-mono text-xs">{a.waVerifyToken}</code>
                  <CopyText value={a.waVerifyToken} />
                </div>
              ) : (
                <p className="text-ink-500">Save your number first — we&apos;ll generate one.</p>
              )}
            </div>
            <p className="text-xs leading-5 text-ink-500">Add your Meta App Secret in step 1 so we can verify that every webhook really comes from Meta.</p>
          </div>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader title="3. Forward incoming messages to your server" description="We POST every incoming message and delivery receipt to this URL, signed with your secret." />
        <div className="p-5">
          <WebhookForm webhookUrl={a.webhookUrl ?? ""} secret={a.webhookSecret} />
        </div>
      </Card>
    </>
  );
}
