"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DOCS_NAV } from "./nav";

export function DocsSidebar() {
  const path = usePathname();
  return (
    <nav className="space-y-6 text-sm">
      {DOCS_NAV.map((g) => (
        <div key={g.title}>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-400">{g.title}</div>
          <ul className="space-y-0.5 border-l border-ink-100">
            {g.items.map((i) => (
              <li key={i.href}>
                <Link
                  href={i.href}
                  className={cn("-ml-px block border-l py-1.5 pl-3 transition-colors", path === i.href ? "border-brand-600 font-medium text-brand-700" : "border-transparent text-ink-600 hover:border-ink-300 hover:text-ink-900")}
                >
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function DocsPager() {
  const path = usePathname();
  const flat = DOCS_NAV.flatMap((g) => g.items);
  const i = flat.findIndex((x) => x.href === path);
  const prev = i > 0 ? flat[i - 1] : null;
  const next = i >= 0 && i < flat.length - 1 ? flat[i + 1] : null;
  return (
    <div className="mt-14 flex justify-between gap-4 border-t border-ink-100 pt-6 text-sm">
      {prev ? <Link href={prev.href} className="text-ink-600 hover:text-brand-700">← {prev.label}</Link> : <span />}
      {next ? <Link href={next.href} className="font-medium text-brand-700 hover:underline">{next.label} →</Link> : <span />}
    </div>
  );
}
