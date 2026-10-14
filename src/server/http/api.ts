import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError, type ZodTypeAny, type z } from "zod";
import type { ApiKey, Account } from "@prisma/client";
import { findApiKey } from "@/server/services/api-keys.service";
import { InsufficientCreditsError } from "@/server/services/credits.service";
import { WhatsAppNotConnectedError } from "@/server/services/whatsapp.service";
import { AiUnavailableError } from "@/server/services/ai.service";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

export function apiError(e: unknown) {
  if (e instanceof ApiError) return NextResponse.json({ error: { code: e.code, message: e.message, ...(e.details ? { details: e.details } : {}) } }, { status: e.status });
  if (e instanceof ZodError) {
    return NextResponse.json(
      { error: { code: "invalid_request", message: "Some fields are missing or invalid.", details: e.issues.map((i) => ({ field: i.path.join("."), message: i.message })) } },
      { status: 400 },
    );
  }
  if (e instanceof InsufficientCreditsError) return NextResponse.json({ error: { code: "insufficient_credits", message: e.message, details: { needed: e.needed, balance: e.balance } } }, { status: 402 });
  if (e instanceof WhatsAppNotConnectedError) return NextResponse.json({ error: { code: "whatsapp_not_connected", message: e.message } }, { status: 409 });
  if (e instanceof AiUnavailableError) return NextResponse.json({ error: { code: "ai_unavailable", message: e.message } }, { status: 503 });
  console.error("[api] unexpected error", e);
  return NextResponse.json({ error: { code: "internal_error", message: "Something went wrong on our side. Please retry." } }, { status: 500 });
}

export async function parseJson<S extends ZodTypeAny>(req: NextRequest, schema: S): Promise<z.infer<S>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, "invalid_json", "The request body must be valid JSON.");
  }
  return schema.parse(body);
}

export type ApiContext = { key: ApiKey & { account: Account }; account: Account; test: boolean };

/** Bearer API key authentication for /api/v1/*. */
export function withApiKey(handler: (req: NextRequest, ctx: ApiContext, params: Record<string, string>) => Promise<unknown>) {
  return async (req: NextRequest, routeCtx: { params: Promise<Record<string, string>> }) => {
    try {
      const header = req.headers.get("authorization") ?? "";
      const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
      if (!token) throw new ApiError(401, "missing_api_key", "Send your API key in the Authorization header: Bearer wk_live_…");
      const key = await findApiKey(token);
      if (!key) throw new ApiError(401, "invalid_api_key", "This API key is invalid or was revoked.");
      const params = (await routeCtx?.params) ?? {};
      const data = await handler(req, { key, account: key.account, test: key.mode === "TEST" }, params);
      return data instanceof Response ? data : NextResponse.json(data);
    } catch (e) {
      return apiError(e);
    }
  };
}
