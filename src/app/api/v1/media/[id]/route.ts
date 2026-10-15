import { NextResponse } from "next/server";
import { ApiError, withApiKey } from "@/server/http/api";
import { providerFor } from "@/server/services/whatsapp.service";

/**
 * GET /api/v1/media/:id — download the image, voice note or document of an incoming message
 * (the `media.id` from the webhook). Free. Not available with test keys.
 */
export const GET = withApiKey(async (_req, { account, test }, params) => {
  if (test) throw new ApiError(404, "not_found", "Test keys have no real media to download.");
  const id = params.id;
  if (!/^[\w.-]{3,128}$/.test(id ?? "")) throw new ApiError(400, "invalid_media_id", "Invalid media id.");
  const provider = providerFor(account); // throws whatsapp_not_connected
  let bytes: Buffer | null;
  try {
    bytes = await provider.downloadMedia({ id, mimeType: "application/octet-stream" });
  } catch {
    throw new ApiError(404, "media_not_found", "WhatsApp couldn't find this media (it may have expired — media is kept for about 30 days).");
  }
  if (!bytes) throw new ApiError(404, "media_not_found", "Media not found.");
  return new NextResponse(new Uint8Array(bytes), { headers: { "Content-Type": "application/octet-stream", "Cache-Control": "private, max-age=3600" } });
});
