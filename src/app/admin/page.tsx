import Link from "next/link";
import { Bot, Coins, CreditCard, MessageCircle, ShoppingCart, Users } from "lucide-react";
import { PLAN_BY_ID } from "@/lib/plans";
import { formatDate, formatEgp, formatNumber } from "@/lib/utils";
import { adminStats, recentAdminLogs } from "@/server/services/admin.service";
import { PageTitle, Stat } from "@/components/dashboard/page-title";
import { Card, CardHeader } from "@/components/ui/card";
import { Alert } from "@/components/ui/form";

export default async function AdminHome() {
  const [s, logs] = await Promise.all([adminStats(), recentAdminLogs()]);
  return (
    <>
      <PageTitle title="Admin overview" description="This month (UTC) unless noted. Usage counts live keys only." />
      {s.pendingOrders > 0 && (
        <Alert tone="warning" className="mb-6">
          {s.pendingOrders} order{s.pendingOrders > 1 ? "s" : ""} waiting for activation. <Link href="/admin/orders" className="font-medium underline">Review orders →</Link>
        </Alert>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Customers" value={formatNumber(s.customers)} icon={Users} hint={`+${s.newCustomers} this month · ${s.unverified} unconfirmed`} />
        <Stat label="Paid plans" value={formatNumber(s.paidTotal)} icon={CreditCard} hint={s.paidPlans.map((p) => `${p.count} ${PLAN_BY_ID[p.plan].name}`).join(" · ") || "none yet"} />
        <Stat label="Revenue (paid orders)" value={formatEgp(s.revenueEgp)} icon={ShoppingCart} hint="Before VAT" />
        <Stat label="Credits in balances" value={formatNumber(s.creditsOutstanding)} icon={Coins} hint={`${formatNumber(s.creditsUsed)} used this month`} />
        <Stat label="Messages sent" value={formatNumber(s.messagesSent)} icon={MessageCircle} />
        <Stat label="Messages received" value={formatNumber(s.messagesReceived)} icon={MessageCircle} />
        <Stat label="AI replies" value={formatNumber(s.aiRequests)} icon={Bot} hint={`${formatNumber(s.aiTokens)} tokens`} />
        <Stat label="Pending orders" value={formatNumber(s.pendingOrders)} icon={ShoppingCart} hint={<Link href="/admin/orders" className="text-brand-700 hover:underline">Open →</Link>} />
      </div>
      <Card className="mt-6">
        <CardHeader title="Recent admin actions" />
        {logs.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink-500">Nothing yet.</p>
        ) : (
          <ul className="divide-y divide-ink-100 text-sm">
            {logs.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5">
                <span>
                  <span className="font-medium">{l.detail}</span>
                  {l.accountId && <Link href={`/admin/customers/${l.accountId}`} className="ml-2 text-brand-700 hover:underline">account</Link>}
                </span>
                <span className="text-xs text-ink-500">{l.adminEmail} · {formatDate(l.createdAt, true)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
