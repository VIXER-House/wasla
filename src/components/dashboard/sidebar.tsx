"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, CreditCard, KeyRound, LayoutDashboard, MessageCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/api-keys", label: "API keys", icon: KeyRound },
  { href: "/dashboard/usage", label: "Usage", icon: BarChart3 },
  { href: "/dashboard/billing", label: "Credits & billing", icon: CreditCard },
  { href: "/dashboard/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardNav({ mobile }: { mobile?: boolean }) {
  const path = usePathname();
  const active = (href: string) => (href === "/dashboard" ? path === href : path.startsWith(href));
  return (
    <nav className={cn(mobile ? "flex gap-1 overflow-x-auto" : "space-y-0.5")}>
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          className={cn(
            "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
            active(n.href) ? "bg-brand-50 font-medium text-brand-800" : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
          )}
        >
          <n.icon className="h-4 w-4" /> {n.label}
        </Link>
      ))}
      {!mobile && (
        <Link href="/docs" className="mt-4 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-600 hover:bg-ink-100 hover:text-ink-900">
          <BookOpen className="h-4 w-4" /> Documentation
        </Link>
      )}
    </nav>
  );
}
