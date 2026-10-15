import Link from "next/link";
import { ArrowLeft, LayoutDashboard, ShieldCheck, ShoppingCart, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  const pending = await db.order.count({ where: { status: "PENDING" } });
  const nav = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart, badge: pending },
    { href: "/admin/customers", label: "Customers", icon: Users },
  ];
  return (
    <div className="min-h-screen bg-ink-50/60">
      <header className="sticky top-0 z-30 border-b border-ink-800 bg-ink-950 text-white">
        <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Logo href="/admin" invert />
            <Badge className="bg-amber-400/15 text-amber-300"><ShieldCheck className="h-3 w-3" /> Admin</Badge>
          </div>
          <nav className="flex items-center gap-1 text-sm">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-ink-300 hover:bg-white/10 hover:text-white">
                <n.icon className="h-4 w-4" /> <span className="hidden sm:inline">{n.label}</span>
                {!!n.badge && <span className="rounded-full bg-amber-400 px-1.5 text-[11px] font-semibold text-ink-950">{n.badge}</span>}
              </Link>
            ))}
            <Link href="/dashboard" className="ml-2 hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-ink-400 hover:text-white md:flex">
              <ArrowLeft className="h-4 w-4" /> My dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4 lg:p-8">
        {children}
        <p className="mt-10 text-center text-xs text-ink-400">Signed in as {me.email}</p>
      </main>
    </div>
  );
}
