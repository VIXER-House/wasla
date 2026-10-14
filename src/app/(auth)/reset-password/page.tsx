import type { Metadata } from "next";
import Link from "next/link";
import { checkResetToken } from "@/server/services/auth.service";
import { AuthCard } from "@/components/auth-ui";
import { Alert } from "@/components/ui/form";
import { ResetForm } from "./form";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!token || !(await checkResetToken(token))) {
    return (
      <AuthCard title="Link expired">
        <Alert tone="error">This reset link is invalid or has expired.</Alert>
        <p className="mt-4 text-sm"><Link href="/forgot-password" className="font-medium text-brand-700 hover:underline">Ask for a new link</Link></p>
      </AuthCard>
    );
  }
  return <ResetForm token={token} />;
}
