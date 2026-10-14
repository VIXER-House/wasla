import Link from "next/link";
import { Coins, LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { PLAN_BY_ID } from "@/lib/plans";
import { formatNumber } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/card";
import { DashboardNav } from "@/components/dashboard/sidebar";
import { logoutAction } from "@/app/(auth)/actions";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const a = user.account;
  return (
    <div className="min-h-screen bg-ink-50/60">
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-white">
        <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-6">
          <Logo href="/dashboard" />
          <div className="flex items-center gap-3">
            <Link href="/dashboard/billing" className="hidden items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1 text-sm hover:bg-ink-50 sm:flex">
              <Coins className="h-4 w-4 text-amber-500" />
              <span className="font-semibold num">{formatNumber(a.credits)}</span>
              <span className="text-ink-500">credits</span>
            </Link>
            <Badge tone={a.plan === "FREE" ? "neutral" : "green"}>{PLAN_BY_ID[a.plan].name}</Badge>
            <span className="hidden text-sm text-ink-600 md:inline">{user.email}</span>
            <form action={logoutAction}>
              <button className="rounded-md p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-900" title="Sign out" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-ink-100 px-2 py-1.5 lg:hidden">
          <DashboardNav mobile />
        </div>
      </header>
      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 border-r border-ink-200 bg-white p-3 lg:block">
          <DashboardNav />
        </aside>
        <main className="min-w-0 flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
