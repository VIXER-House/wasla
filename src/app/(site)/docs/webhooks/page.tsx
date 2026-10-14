import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Note, Params } from "@/components/docs/blocks";

export const metadata: Metadata = { title: "Receive messages (webhooks)" };

export default function WebhooksDocs() {
  return (
    <>
      <h1>Receive messages</h1>
      <p>
        When a customer writes to your WhatsApp number, we POST it to <strong>your webhook URL</strong> (set it in{" "}
        <Link href="/dashboard/whatsapp">Dashboard → WhatsApp</Link>). Delivery receipts for messages you sent arrive the same way. Receiving is free.
      </p>
      <h2>Payload</h2>
      <CodeBlock
        code={`POST https://your-app.com/webhooks/wasla
Content-Type: application/json
X-Wasla-Signature: sha256=5d0c1b…

{
  "type": "whatsapp.events",
  "accountId": "cm2…",
  "messages": [
    {
      "from": "+201001234567",
      "providerMessageId": "wamid.HBgM…",
      "timestamp": "2026-10-15T09:12:44.000Z",
      "type": "text",
      "text": "الحنفية بتنقط في المطبخ",
      "profileName": "Mona"
    }
  ],
  "statuses": [
    { "providerMessageId": "wamid.HBgN…", "recipient": "+201001234567", "status": "read", "timestamp": "2026-10-15T09:12:40.000Z" }
  ]
}`}
      />
      <Params
        rows={[
          ["messages[].type", "string", <><code>text</code>, <code>image</code>, <code>audio</code>, <code>video</code> or <code>document</code>. Locations and button taps arrive as <code>text</code>.</>],
          ["messages[].replyId", "string", "Id of the reply button or list row the customer tapped."],
          ["messages[].media", "object", <>For media: <code>{`{ id, mimeType, caption, fileName }`}</code>.</>],
          ["statuses[].status", "string", <><code>sent</code>, <code>delivered</code>, <code>read</code> or <code>failed</code> (with <code>error</code>).</>],
        ]}
      />
      <h2>Verify the signature</h2>
      <p>Each request carries <code>X-Wasla-Signature</code>: <code>sha256=</code> + the HMAC-SHA256 of the <strong>raw request body</strong> using your signing secret. Reject requests where it doesn&apos;t match.</p>
      <CodeBlock
        title="Node.js (Express)"
        code={`import crypto from "node:crypto";
import express from "express";

const app = express();
app.post("/webhooks/wasla", express.raw({ type: "application/json" }), (req, res) => {
  const expected = "sha256=" + crypto.createHmac("sha256", process.env.WASLA_WEBHOOK_SECRET).update(req.body).digest("hex");
  const got = req.get("X-Wasla-Signature") ?? "";
  if (got.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected))) {
    return res.status(401).end();
  }
  const event = JSON.parse(req.body.toString("utf8"));
  for (const m of event.messages) console.log(m.from, m.text);
  res.sendStatus(200); // answer fast; do slow work in the background
});`}
      />
      <CodeBlock
        title="PHP"
        code={`$raw = file_get_contents('php://input');
$expected = 'sha256=' . hash_hmac('sha256', $raw, getenv('WASLA_WEBHOOK_SECRET'));
if (!hash_equals($expected, $_SERVER['HTTP_X_WASLA_SIGNATURE'] ?? '')) { http_response_code(401); exit; }
$event = json_decode($raw, true);`}
      />
      <Note>Answer with any 2xx status within 8 seconds. The same message can occasionally arrive twice — use <code>providerMessageId</code> to ignore duplicates.</Note>
    </>
  );
}
