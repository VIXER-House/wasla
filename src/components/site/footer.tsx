import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  const cols = [
    { title: "Product", links: [["/#features", "Features"], ["/pricing", "Pricing"], ["/#use-cases", "Use cases"]] },
    { title: "Developers", links: [["/docs", "Documentation"], ["/docs/quickstart", "Quickstart"], ["/docs/api/messages", "API reference"]] },
    { title: "Account", links: [["/signup", "Create account"], ["/login", "Sign in"], ["/dashboard", "Dashboard"]] },
  ];
  return (
    <footer className="border-t border-ink-100 bg-ink-50/60">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-6 text-ink-500">{BRAND.tagline}</p>
          <p className="mt-4 text-sm text-ink-500">
            <a href={`mailto:${BRAND.supportEmail}`} className="hover:text-ink-900">{BRAND.supportEmail}</a>
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h3 className="text-sm font-semibold text-ink-900">{c.title}</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-500">
              {c.links.map(([href, label]) => (
                <li key={href}><Link href={href} className="hover:text-ink-900">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-ink-100">
        <div className="container flex flex-wrap items-center justify-between gap-2 py-5 text-xs text-ink-400">
          <span>© {new Date().getFullYear()} {BRAND.company}. All rights reserved.</span>
          <span>WhatsApp is a trademark of WhatsApp LLC. {BRAND.name} uses the official WhatsApp Business Platform.</span>
        </div>
      </div>
    </footer>
  );
}
