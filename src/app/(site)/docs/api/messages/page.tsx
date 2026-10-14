import type { Metadata } from "next";
import { appUrl } from "@/lib/config";
import { CodeBlock } from "@/components/code-block";
import { Endpoint, Note, Params } from "@/components/docs/blocks";

export const metadata: Metadata = { title: "Send a message" };

export default function MessagesDocs() {
  const api = appUrl("/api/v1");
  return (
    <>
      <h1>Send a message</h1>
      <Endpoint method="POST" path="/api/v1/messages" />
      <p>Sends a WhatsApp message from your connected number. Costs <strong>1 credit</strong> with a live key and nothing with a test key. If WhatsApp rejects the message, the credit is refunded.</p>
      <h2>Body</h2>
      <Params
        rows={[
          ["to", "string", <>Recipient in international format, e.g. <code>+201001234567</code>.</>, true],
          ["text", "string", "Message text (up to 4,096 characters). Use within 24 hours of the customer's last message."],
          ["template", "object", <>An approved template: <code>{`{ name, language, params[] }`}</code>. Required outside the 24-hour window.</>],
        ]}
      />
      <p>Send either <code>text</code> or <code>template</code>, not both.</p>
      <h2>Text example</h2>
      <CodeBlock
        code={`curl ${api}/messages \\
  -H "Authorization: Bearer $WASLA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "to": "+201001234567", "text": "تم تأكيد حجزك ✅ الساعة 9 مساءً" }'`}
      />
      <h2>Template example</h2>
      <CodeBlock
        code={`curl ${api}/messages \\
  -H "Authorization: Bearer $WASLA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+201001234567",
    "template": { "name": "booking_reminder", "language": "ar", "params": ["Ahmed", "9:00 PM"] }
  }'`}
      />
      <h2>Response</h2>
      <CodeBlock code={`{\n  "id": "wamid.HBgMMjAxMDAxMjM0NTY3FQIAERgS…",\n  "status": "sent",\n  "to": "+201001234567",\n  "mode": "live",\n  "creditsUsed": 1,\n  "creditsRemaining": 4999\n}`} />
      <p><code>id</code> is WhatsApp&apos;s message id. Delivery updates (delivered, read, failed) for it arrive on your <a href="/docs/webhooks">webhook</a>.</p>
      <h2>Errors</h2>
      <Params
        rows={[
          ["400 invalid_phone", "", "The number isn't in international format."],
          ["402 insufficient_credits", "", "Top up or upgrade."],
          ["409 whatsapp_not_connected", "", "Connect a number, or use a test key."],
          ["502 whatsapp_error", "", "WhatsApp rejected the message (the reason is in the message). No credit is charged."],
        ]}
      />
      <Note>Long texts are split into several WhatsApp messages automatically.</Note>
    </>
  );
}
