import { Coins } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CREDIT_PACKS, PLAN_BY_ID, PLANS } from "@/lib/plans";
import { formatDate, formatEgp, formatNumber } from "@/lib/utils";
import { PageTitle } from "@/components/dashboard/page-title";
import { Badge, Card, CardHeader } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

export default async function BillingPage() {
  const user = await requireUser();
  const a = user.account;
  const [tx, orders] = await Promise.all([
    db.creditTransaction.findMany({ where: { accountId: a.id }, orderBy: { createdAt: "desc" }, take: 30 }),
    db.order.findMany({ where: { accountId: a.id }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);
  const plan = PLAN_BY_ID[a.plan];
  return (
    <>
      <PageTitle title="Credits & billing" description="Your balance, plan and every credit movement." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-sm text-ink-500"><Coins className="h-4 w-4 text-amber-500" /> Credit balance</div>
          <div className="mt-2 text-4xl font-semibold tracking-tight num">{formatNumber(a.credits)}</div>
          <div className="mt-5 grid gap-2">
            {CREDIT_PACKS.map((p) => (
              <LinkButton key={p.id} href={`/checkout?pack=${p.id}`} variant="outline" size="sm" className="justify-between">
                <span>+{formatNumber(p.credits)} credits</span>
                <span className="text-ink-500">{formatEgp(p.priceEgp)}</span>
              </LinkButton>
            ))}
          </div>
        </Card>
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-ink-500">Current plan</div>
              <div className="mt-1 text-2xl font-semibold">{plan.name}</div>
              <p className="mt-1 text-sm text-ink-500">
                {plan.priceEgp ? `${formatEgp(plan.priceEgp)} / month · ${formatNumber(plan.monthlyCredits)} credits each month` : plan.blurb}
                {a.planRenewsAt && ` · renews ${formatDate(a.planRenewsAt)}`}
              </p>
            </div>
            <LinkButton href="/pricing" variant="outline" size="sm">Compare plans</LinkButton>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {PLANS.filter((p) => p.priceEgp && p.id !== a.plan).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-ink-200 p-4">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-ink-500">{formatNumber(p.monthlyCredits)} credits / month</div>
                </div>
                <LinkButton href={`/checkout?plan=${p.id.toLowerCase()}`} size="sm">{formatEgp(p.priceEgp!)}</LinkButton>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader title="Credit history" />
          {tx.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-500">No credit movements yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-ink-100">
                {tx.map((t) => (
                  <tr key={t.id}>
                    <td className="px-5 py-2.5 text-ink-500 whitespace-nowrap">{formatDate(t.createdAt, true)}</td>
                    <td className="px-5 py-2.5">{t.reason}</td>
                    <td className={`px-5 py-2.5 text-right font-medium num ${t.amount > 0 ? "text-brand-700" : "text-ink-700"}`}>{t.amount > 0 ? `+${formatNumber(t.amount)}` : formatNumber(t.amount)}</td>
                    <td className="px-5 py-2.5 text-right text-ink-500 num">{formatNumber(t.balanceAfter)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card>
          <CardHeader title="Orders" />
          {orders.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-500">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <div className="font-medium">{o.item}</div>
                    <div className="text-xs text-ink-500">{formatDate(o.createdAt)} · {formatEgp(o.amountEgp)}</div>
                  </div>
                  <Badge tone={o.status === "PAID" ? "green" : o.status === "PENDING" ? "amber" : "neutral"}>{o.status.toLowerCase()}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
