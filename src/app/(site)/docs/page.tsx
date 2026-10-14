import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { appUrl } from "@/lib/config";

export const metadata: Metadata = { title: "Documentation" };

export default function DocsHome() {
  return (
    <>
      <h1>{BRAND.name} documentation</h1>
      <p>
        {BRAND.name} gives your product a WhatsApp channel with AI built in. Your server calls a small JSON API to <strong>send messages</strong> and get{" "}
        <strong>AI replies</strong>, and we forward <strong>incoming messages</strong> to your webhook. Everything runs on the official WhatsApp Business Platform.
      </p>
      <h2>How the pieces fit</h2>
      <ol>
        <li><strong>Your account</strong> holds API keys, credits and your WhatsApp connection.</li>
        <li><strong>Your server</strong> calls <code>{appUrl("/api/v1")}</code> with an API key.</li>
        <li><strong>WhatsApp (Meta)</strong> delivers messages; replies from customers come back through our webhook to yours.</li>
      </ol>
      <h2>Start here</h2>
      <ul>
        <li><Link href="/docs/quickstart">Quickstart</Link> — send your first (test) message in 5 minutes.</li>
        <li><Link href="/docs/whatsapp-setup">Connect WhatsApp</Link> — go live with your own number.</li>
        <li><Link href="/docs/webhooks">Receive messages</Link> — get every incoming message on your server.</li>
        <li><Link href="/docs/api/ai">AI reply</Link> — let the AI write the next message in Arabic or English.</li>
      </ul>
      <h2>Base URL</h2>
      <p>All endpoints live under:</p>
      <p><code>{appUrl("/api/v1")}</code></p>
      <p>Requests and responses are JSON. Times are ISO-8601 in UTC. Phone numbers use international format, e.g. <code>+201001234567</code>.</p>
    </>
  );
}
