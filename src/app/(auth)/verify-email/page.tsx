import type { Metadata } from "next";
import { VerifyEmail } from "./view";

export const metadata: Metadata = { title: "Confirm email" };

/**
 * The emailed link lands here. Confirmation happens on a button press (POST), not on page load,
 * so email security scanners that pre-open links can't use up the token.
 */
export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <VerifyEmail token={token ?? ""} />;
}
