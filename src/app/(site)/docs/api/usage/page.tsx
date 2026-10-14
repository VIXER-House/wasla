import type { Metadata } from "next";
import { appUrl } from "@/lib/config";
import { CodeBlock } from "@/components/code-block";
import { Endpoint, Params } from "@/components/docs/blocks";

export const metadata: Metadata = { title: "Usage" };

export default function UsageDocs() {
  return (
    <>
      <h1>Usage</h1>
      <Endpoint method="GET" path="/api/v1/usage?days=30" />
      <p>Per-day usage (UTC) and totals for the last <code>days</code> days (1–90, default 30) — the same numbers as your dashboard.</p>
      <Params rows={[["days", "number", "How many days back, including today."]]} />
      <CodeBlock code={`curl "${appUrl("/api/v1/usage?days=7")}" \\\n  -H "Authorization: Bearer $WASLA_API_KEY"`} />
      <CodeBlock
        title="Response"
        code={`{
  "days": 7,
  "totals": { "messagesSent": 412, "messagesReceived": 389, "aiRequests": 301, "aiTokens": 157200, "credits": 724 },
  "daily": [
    { "day": "2026-10-08", "messagesSent": 51, "messagesReceived": 47, "aiRequests": 40, "aiTokens": 20110, "credits": 92 }
  ],
  "creditsRemaining": 4276
}`}
      />
    </>
  );
}
