import type { Metadata } from "next";
import { appUrl } from "@/lib/config";
import { CodeBlock } from "@/components/code-block";
import { Endpoint } from "@/components/docs/blocks";

export const metadata: Metadata = { title: "Account & balance" };

export default function AccountDocs() {
  return (
    <>
      <h1>Account & balance</h1>
      <Endpoint method="GET" path="/api/v1/account" />
      <p>Returns your plan, current credit balance and connection status. Free to call — handy for health checks.</p>
      <CodeBlock code={`curl ${appUrl("/api/v1/account")} \\\n  -H "Authorization: Bearer $WASLA_API_KEY"`} />
      <CodeBlock
        title="Response"
        code={`{
  "id": "cm2…",
  "name": "Nile Bistro",
  "plan": "STARTER",
  "planName": "Starter",
  "planRenewsAt": "2026-11-14T10:00:00.000Z",
  "credits": 4821,
  "whatsappConnected": true,
  "key": { "name": "Production server", "mode": "live" }
}`}
      />
    </>
  );
}
