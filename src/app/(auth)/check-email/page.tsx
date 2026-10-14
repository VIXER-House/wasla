import type { Metadata } from "next";
import { CheckEmail } from "./view";

export const metadata: Metadata = { title: "Confirm your email" };

export default async function CheckEmailPage({ searchParams }: { searchParams: Promise<{ email?: string; sent?: string; dev?: string }> }) {
  const sp = await searchParams;
  return <CheckEmail email={sp.email ?? ""} justSent={sp.sent === "1"} devLink={process.env.EMAIL_DEV_LINKS === "1" ? sp.dev : undefined} />;
}
