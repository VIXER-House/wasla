import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { LinkButton } from "@/components/ui/button";

const NAV = [
  { href: "/#features", label: "Product" },
  { href: "/#use-cases", label: "Use cases" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
];

export async function SiteHeader() {
  const user = await getCurrentUser().catch(() => null);
  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/85 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-ink-600 md:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="transition-colors hover:text-ink-950">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {user?.emailVerifiedAt ? (
            <LinkButton href="/dashboard" size="sm">Dashboard</LinkButton>
          ) : (
            <>
              <LinkButton href="/login" variant="ghost" size="sm">Sign in</LinkButton>
              <LinkButton href="/signup" size="sm">Get started free</LinkButton>
            </>
          )}
        </div>
      </div>
      <nav className="container flex gap-5 overflow-x-auto pb-2.5 text-sm text-ink-600 md:hidden">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="shrink-0 hover:text-ink-950">{n.label}</Link>
        ))}
      </nav>
    </header>
  );
}
