import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reset?: string }> }) {
  const user = await getCurrentUser();
  if (user?.emailVerifiedAt) redirect("/dashboard");
  const sp = await searchParams;
  return <LoginForm next={sp.next ?? "/dashboard"} />;
}
