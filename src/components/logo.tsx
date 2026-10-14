import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7", className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#059669" />
      <path d="M9 11.5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-4.5L12 23v-3.5a3 3 0 0 1-3-3z" fill="#fff" />
      <circle cx="13.5" cy="14" r="1.4" fill="#059669" />
      <circle cx="18.5" cy="14" r="1.4" fill="#059669" />
      <path d="M13.5 14h5" stroke="#059669" strokeWidth="1.2" />
    </svg>
  );
}

export function Logo({ href = "/", className, invert }: { href?: string; className?: string; invert?: boolean }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", invert ? "text-white" : "text-ink-950", className)}>
      <LogoMark />
      <span className="text-lg">{BRAND.name}</span>
    </Link>
  );
}
