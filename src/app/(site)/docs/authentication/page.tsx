import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Note } from "@/components/docs/blocks";

export const metadata: Metadata = { title: "Authentication" };

export default function AuthDocs() {
  return (
    <>
      <h1>Authentication</h1>
      <p>Every request needs an API key in the <code>Authorization</code> header:</p>
      <CodeBlock code={`Authorization: Bearer wk_live_9f2c…`} />
      <h2>Live and test keys</h2>
      <table>
        <thead><tr><th>Prefix</th><th>What it does</th><th>Credits</th></tr></thead>
        <tbody>
          <tr><td><code>wk_live_</code></td><td>Sends real WhatsApp messages from your connected number and calls the AI model.</td><td>Yes</td></tr>
          <tr><td><code>wk_test_</code></td><td>Simulates sends and AI replies. Usage is logged and visible in your dashboard.</td><td>Never</td></tr>
        </tbody>
      </table>
      <h2>Keeping keys safe</h2>
      <ul>
        <li>Call the API from your <strong>server</strong> only. Never put a key in a website, mobile app or public repository.</li>
        <li>Store keys in environment variables, e.g. <code>WASLA_API_KEY</code>.</li>
        <li>Use one key per app or environment so you can revoke one without affecting the others.</li>
        <li>We store only a hash of each key. If you lose one, create a new key and revoke the old one.</li>
      </ul>
      <Note tone="warning">A revoked key stops working immediately. Requests with a missing or revoked key get <code>401</code>.</Note>
    </>
  );
}
