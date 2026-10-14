import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";

export const metadata: Metadata = { title: "Errors" };

const ROWS: [number, string, string][] = [
  [400, "invalid_json / invalid_request", "The body isn't valid JSON or a field is missing/invalid. `details` lists the fields."],
  [400, "invalid_phone", "Use international format, e.g. +201001234567."],
  [401, "missing_api_key / invalid_api_key", "No key, a typo, or the key was revoked."],
  [402, "insufficient_credits", "Your balance can't cover the call. `details` has `needed` and `balance`."],
  [409, "whatsapp_not_connected", "Live sends need a connected number."],
  [502, "whatsapp_error", "WhatsApp refused the message (e.g. outside the 24-hour window without a template)."],
  [503, "ai_unavailable", "The AI provider is unavailable. Retry with backoff."],
  [500, "internal_error", "Something failed on our side. Retry; contact support if it persists."],
];

export default function ErrorsDocs() {
  return (
    <>
      <h1>Errors</h1>
      <p>Errors use standard HTTP status codes and always have the same shape:</p>
      <CodeBlock code={`{\n  "error": {\n    "code": "insufficient_credits",\n    "message": "Not enough credits: this call needs 1, your balance is 0.",\n    "details": { "needed": 1, "balance": 0 }\n  }\n}`} />
      <table>
        <thead><tr><th>Status</th><th>Code</th><th>Meaning</th></tr></thead>
        <tbody>
          {ROWS.map(([s, c, m]) => (
            <tr key={c}><td>{s}</td><td><code>{c}</code></td><td>{m}</td></tr>
          ))}
        </tbody>
      </table>
      <p>Retry <code>5xx</code> responses with exponential backoff. Don&apos;t retry <code>4xx</code> without changing the request.</p>
    </>
  );
}
