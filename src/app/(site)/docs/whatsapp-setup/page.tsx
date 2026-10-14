import type { Metadata } from "next";
import Link from "next/link";
import { Note } from "@/components/docs/blocks";

export const metadata: Metadata = { title: "Connect WhatsApp" };

export default function WhatsAppSetup() {
  return (
    <>
      <h1>Connect your WhatsApp number</h1>
      <p>Live messages go out from <strong>your own</strong> WhatsApp Business number, through Meta&apos;s official Cloud API. You need a Meta Business account and a phone number that is not already used in the WhatsApp app.</p>

      <h2>1. Create the Meta app</h2>
      <ol>
        <li>Go to <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer">developers.facebook.com/apps</a> → <strong>Create app</strong> → type <strong>Business</strong>.</li>
        <li>Add the <strong>WhatsApp</strong> product and pick (or create) your WhatsApp Business account.</li>
        <li>Under <strong>WhatsApp → API Setup</strong>, add and verify your phone number. Copy its <strong>Phone number ID</strong>.</li>
      </ol>

      <h2>2. Create a permanent token</h2>
      <ol>
        <li>In <strong>Business Settings → Users → System users</strong>, add a system user (Admin).</li>
        <li>Assign it your app and WhatsApp account, then <strong>Generate token</strong> with <code>whatsapp_business_messaging</code> and <code>whatsapp_business_management</code>.</li>
        <li>Copy the token. Also copy your <strong>App secret</strong> from <strong>App settings → Basic</strong>.</li>
      </ol>

      <h2>3. Save it in your dashboard</h2>
      <p>Open <Link href="/dashboard/whatsapp">Dashboard → WhatsApp</Link> and paste the Phone number ID, the token and the app secret. Tokens are encrypted before they are stored.</p>

      <h2>4. Point Meta&apos;s webhook to us</h2>
      <ol>
        <li>Copy the <strong>Callback URL</strong> and <strong>Verify token</strong> shown on the same dashboard page.</li>
        <li>In the Meta app: <strong>WhatsApp → Configuration → Webhook → Edit</strong>, paste both and <strong>Verify and save</strong>.</li>
        <li>Under <strong>Webhook fields</strong>, subscribe to <code>messages</code>.</li>
      </ol>
      <p>Now customers&apos; messages reach us, and we forward them to <Link href="/docs/webhooks">your webhook</Link>.</p>

      <Note>
        WhatsApp only lets businesses send free-form text within 24 hours of the customer&apos;s last message. Outside that window, send an approved{" "}
        <strong>template</strong> — see <Link href="/docs/api/messages">Send a message</Link>. Meta bills its conversation fees to your WhatsApp Business account.
      </Note>
    </>
  );
}
