import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Note } from "@/components/docs/blocks";

export const metadata: Metadata = { title: "Node.js library" };

export default function NodeLibraryDocs() {
  return (
    <>
      <h1>Node.js library</h1>
      <p>
        <code>@vixer-house/whatsapp-kit</code> is the typed WhatsApp layer we use ourselves. Use it when you want to run WhatsApp yourself (Meta Cloud API, Twilio, or a test mock) or to parse and verify Meta webhooks
        in your own server. For most products, calling our HTTP API is simpler.
      </p>
      <h2>Install</h2>
      <p>The package is on GitHub Packages. Add an <code>.npmrc</code>, set <code>GITHUB_PACKAGES_TOKEN</code> (a classic token with <code>read:packages</code>), then install:</p>
      <CodeBlock title=".npmrc" code={`@vixer-house:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=\${GITHUB_PACKAGES_TOKEN}`} />
      <CodeBlock code={`npm install @vixer-house/whatsapp-kit zod`} />
      <h2>Send</h2>
      <CodeBlock
        code={`import { createWhatsAppProvider } from "@vixer-house/whatsapp-kit";

const wa = createWhatsAppProvider({
  provider: "meta",
  meta: { token: process.env.WHATSAPP_TOKEN, phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID },
});

await wa.sendMessage("+201001234567", "أهلاً 👋");
await wa.sendButtons("+201001234567", "تأكيد الحجز؟", [
  { id: "confirm", title: "تأكيد" },
  { id: "cancel", title: "إلغاء" },
]);`}
      />
      <h2>Parse a Meta webhook</h2>
      <CodeBlock
        code={`import { parseMetaWebhook, verifyMetaSignature } from "@vixer-house/whatsapp-kit";

if (!verifyMetaSignature(rawBody, req.headers["x-hub-signature-256"], process.env.META_APP_SECRET)) throw new Error("bad signature");
const { messages, statuses } = parseMetaWebhook(JSON.parse(rawBody));`}
      />
      <h2>Verify our webhook signature</h2>
      <CodeBlock
        code={`import { signPayload } from "@vixer-house/whatsapp-kit";

const ok = signPayload(rawBody, process.env.WASLA_WEBHOOK_SECRET) === req.headers["x-wasla-signature"];`}
      />
      <Note>Prefer a constant-time comparison (<code>crypto.timingSafeEqual</code>) in production, as shown on the webhooks page.</Note>
    </>
  );
}
