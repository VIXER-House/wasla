import "server-only";
import { getConfig } from "@/lib/config";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AiReply {
  text: string;
  tokensIn: number;
  tokensOut: number;
  model: string;
}

export class AiUnavailableError extends Error {}

const DEFAULT_INSTRUCTIONS =
  "You are a helpful WhatsApp assistant for a business. Reply briefly and politely, as a WhatsApp message. " +
  "Answer in the same language and dialect as the customer (Egyptian Arabic or English). Never invent prices, policies or facts you were not given.";

/** Gemini generateContent. Token counts come from Gemini's usageMetadata. */
export async function generateReply(input: { messages: ChatTurn[]; instructions?: string | null; maxTokens?: number }): Promise<AiReply> {
  const cfg = getConfig();
  if (!cfg.GEMINI_API_KEY) throw new AiUnavailableError("AI is not configured on this server.");
  const model = cfg.GEMINI_MODEL;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": cfg.GEMINI_API_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: [DEFAULT_INSTRUCTIONS, input.instructions].filter(Boolean).join("\n\n") }] },
      contents: input.messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
      generationConfig: { maxOutputTokens: input.maxTokens ?? 512, temperature: 0.4 },
    }),
    signal: AbortSignal.timeout(30_000),
  });
  const json = (await res.json().catch(() => ({}))) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number };
    error?: { message?: string };
  };
  if (!res.ok) throw new AiUnavailableError(`AI provider error (${res.status})${json.error?.message ? `: ${json.error.message.slice(0, 160)}` : ""}`);
  const text = (json.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("").trim();
  return {
    text: text || "…",
    tokensIn: json.usageMetadata?.promptTokenCount ?? 0,
    tokensOut: json.usageMetadata?.candidatesTokenCount ?? Math.max(0, (json.usageMetadata?.totalTokenCount ?? 0) - (json.usageMetadata?.promptTokenCount ?? 0)),
    model,
  };
}

/** Deterministic reply for test-mode keys (no AI call, no credits). */
export function testReply(messages: ChatTurn[]): AiReply {
  const last = messages.filter((m) => m.role === "user").at(-1)?.content ?? "";
  const arabic = /[؀-ۿ]/.test(last);
  const text = arabic ? `(وضع الاختبار) وصلتني رسالتك: «${last.slice(0, 80)}»` : `(test mode) I received: "${last.slice(0, 80)}"`;
  const est = (s: string) => Math.ceil(s.length / 4);
  return { text, tokensIn: messages.reduce((n, m) => n + est(m.content), 0), tokensOut: est(text), model: "test" };
}
