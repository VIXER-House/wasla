"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/form";

export function SubmitButton({ children, className, variant }: { children: React.ReactNode; className?: string; variant?: "primary" | "dark" | "outline" | "danger" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className={className} variant={variant}>
      {pending && <Loader2 className="animate-spin" />} {children}
    </Button>
  );
}

/** Development helper: shows the link that would have been emailed (EMAIL_DEV_LINKS=1). */
export function DevLink({ href }: { href?: string }) {
  if (!href) return null;
  return (
    <Alert tone="warning" className="mt-4 break-all">
      <strong>Dev mode — email not sent.</strong> Open the link: <a href={href} className="font-medium underline">{href}</a>
    </Alert>
  );
}

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-7 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight text-ink-950">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}
