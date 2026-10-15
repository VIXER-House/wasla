"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

/** Submit button that asks for confirmation first (inside a server-action form). */
export function ConfirmButton({ confirm, children, tone = "default", className }: { confirm?: string; children: React.ReactNode; tone?: "default" | "primary" | "danger"; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      className={cn(
        "inline-flex h-8 items-center rounded-md px-3 text-xs font-medium transition-colors disabled:opacity-50",
        tone === "primary" ? "bg-brand-600 text-white hover:bg-brand-700" : tone === "danger" ? "border border-red-200 text-red-700 hover:bg-red-50" : "border border-ink-200 text-ink-700 hover:bg-ink-50",
        className,
      )}
    >
      {pending ? "…" : children}
    </button>
  );
}
