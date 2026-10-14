import type { Metadata } from "next";
import { appUrl } from "@/lib/config";
import { CodeBlock } from "@/components/code-block";
import { Endpoint, Note, Params } from "@/components/docs/blocks";

export const metadata: Metadata = { title: "AI reply" };

export default function AiDocs() {
  const api = appUrl("/api/v1");
  return (
    <>
      <h1>AI reply</h1>
      <Endpoint method="POST" path="/api/v1/ai/reply" />
      <p>Give the conversation so far and your business instructions; get the next WhatsApp-style reply. The AI answers in the customer&apos;s language — Egyptian Arabic, MSA or English.</p>
      <h2>Body</h2>
      <Params
        rows={[
          ["messages", "array", <>The conversation, oldest first: <code>{`[{ "role": "user" | "assistant", "content": "…" }]`}</code>. Up to 40 turns.</>, true],
          ["instructions", "string", "What the AI should know and how to behave: your business, hours, prices, tone, what not to promise."],
          ["maxTokens", "number", "Upper limit for the reply length (16–2048, default 512)."],
        ]}
      />
      <h2>Example</h2>
      <CodeBlock
        code={`curl ${api}/ai/reply \\
  -H "Authorization: Bearer $WASLA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "instructions": "You are the assistant of Dr. Salma's dental clinic. Working hours Sat–Thu 4–10pm. Consultation 400 EGP. Offer to book; never diagnose.",
    "messages": [
      { "role": "user", "content": "السلام عليكم، الكشف بكام؟" }
    ]
  }'`}
      />
      <CodeBlock title="Response" code={`{\n  "reply": "وعليكم السلام 👋 الكشف بـ 400 جنيه. تحب أحجزلك ميعاد؟ العيادة شغالة من السبت للخميس من 4 لـ 10 بالليل.",\n  "usage": { "inputTokens": 118, "outputTokens": 46, "credits": 1 },\n  "creditsRemaining": 4998,\n  "mode": "live"\n}`} />
      <h2>Pricing</h2>
      <p>1 credit per started 1,000 tokens (input + output). Most WhatsApp replies cost 1 credit. Test keys return a placeholder reply for free.</p>
      <Note>The AI only knows what you put in <code>instructions</code> and <code>messages</code>. Include the facts it needs (prices, hours, availability) — it is told not to invent them.</Note>
      <h2>Typical flow</h2>
      <ol>
        <li>A customer message arrives on your <a href="/docs/webhooks">webhook</a>.</li>
        <li>Your server loads the recent conversation and calls <code>/ai/reply</code>.</li>
        <li>You check the reply (or not) and send it with <a href="/docs/api/messages"><code>/messages</code></a>.</li>
      </ol>
    </>
  );
}
