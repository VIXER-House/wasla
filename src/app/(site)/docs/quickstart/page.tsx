import type { Metadata } from "next";
import Link from "next/link";
import { appUrl } from "@/lib/config";
import { CodeBlock } from "@/components/code-block";
import { Note } from "@/components/docs/blocks";

export const metadata: Metadata = { title: "Quickstart" };

export default function Quickstart() {
  const api = appUrl("/api/v1");
  return (
    <>
      <h1>Quickstart</h1>
      <p>Send a WhatsApp message and get an AI reply using a <strong>test key</strong> — no WhatsApp number and no credits needed.</p>

      <h2>1. Create an account and a test key</h2>
      <ol>
        <li><Link href="/signup">Create an account</Link> and confirm your email.</li>
        <li>Open <Link href="/dashboard/api-keys">Dashboard → API keys</Link>, choose <strong>Test</strong> and create a key.</li>
        <li>Copy the key (it starts with <code>wk_test_</code>). It is shown only once.</li>
      </ol>

      <h2>2. Check the key</h2>
      <CodeBlock code={`curl ${api}/account \\\n  -H "Authorization: Bearer wk_test_YOUR_KEY"`} />
      <p>You get your plan, credit balance and whether a WhatsApp number is connected.</p>

      <h2>3. Send a message</h2>
      <CodeBlock
        code={`curl ${api}/messages \\
  -H "Authorization: Bearer wk_test_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "to": "+201001234567", "text": "Hello from my app 👋" }'`}
      />
      <CodeBlock title="Response" code={`{\n  "id": "mock.3f6c…",\n  "status": "sent",\n  "to": "+201001234567",\n  "mode": "test",\n  "creditsUsed": 0,\n  "creditsRemaining": 200\n}`} />
      <Note>Test keys simulate delivery — nothing is sent to a real phone. Switch to a <code>wk_live_</code> key after you <Link href="/docs/whatsapp-setup">connect your WhatsApp number</Link>.</Note>

      <h2>4. Ask the AI for a reply</h2>
      <CodeBlock
        code={`curl ${api}/ai/reply \\
  -H "Authorization: Bearer wk_test_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "instructions": "You answer for Nile Bistro. Open daily 12pm–1am. Tables up to 8 people.",
    "messages": [{ "role": "user", "content": "عايز احجز ترابيزة ل 4 النهارده الساعة 9" }]
  }'`}
      />
      <p>Test keys return a placeholder reply for free. Live keys call the AI model and use credits based on tokens.</p>

      <h2>5. In your code (Node.js)</h2>
      <CodeBlock
        title="send.mjs"
        code={`const res = await fetch("${api}/messages", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.WASLA_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ to: "+201001234567", text: "Your order is on the way 🚚" }),
});
const data = await res.json();
if (!res.ok) throw new Error(data.error.message);
console.log(data.id, data.creditsRemaining);`}
      />
      <h2>Next</h2>
      <ul>
        <li><Link href="/docs/whatsapp-setup">Connect your WhatsApp number</Link></li>
        <li><Link href="/docs/webhooks">Receive incoming messages</Link></li>
      </ul>
    </>
  );
}
