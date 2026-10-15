import Link from "next/link";
import { formatDate, formatEgp } from "@/lib/utils";
import { listOrders } from "@/server/services/admin.service";
import { PageTitle } from "@/components/dashboard/page-title";
import { Badge, Card } from "@/components/ui/card";
import { cancelOrderAction, markPaidAction } from "../actions";
import { ConfirmButton } from "../confirm-button";

const TABS = ["PENDING", "PAID", "CANCELLED", "ALL"] as const;

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const status = (TABS as readonly string[]).includes(sp.status ?? "") ? (sp.status as (typeof TABS)[number]) : "PENDING";
  const orders = await listOrders(status);
  return (
    <>
      <PageTitle
        title="Orders"
        description="Checkout is offline for now: contact the customer, collect payment, then mark the order as paid. That activates the plan and adds the credits."
        actions={
          <div className="flex rounded-lg border border-ink-200 bg-white p-0.5 text-sm">
            {TABS.map((t) => (
              <Link key={t} href={`?status=${t}`} className={t === status ? "rounded-md bg-ink-900 px-3 py-1 text-white" : "rounded-md px-3 py-1 text-ink-600 hover:bg-ink-50"}>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </Link>
            ))}
          </div>
        }
      />
      <Card>
        {orders.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-ink-500">No {status === "ALL" ? "" : status.toLowerCase()} orders.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Placed</th>
                  <th className="px-5 py-2.5 font-medium">Customer</th>
                  <th className="px-5 py-2.5 font-medium">Item</th>
                  <th className="px-5 py-2.5 text-right font-medium">Amount</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="whitespace-nowrap px-5 py-3 text-ink-500">{formatDate(o.createdAt, true)}</td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/customers/${o.account.id}`} className="font-medium text-ink-900 hover:text-brand-700">{o.account.owner.name}</Link>
                      <div className="text-xs text-ink-500">{o.account.owner.email}</div>
                    </td>
                    <td className="px-5 py-3">{o.item}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-right num">
                      {formatEgp(o.amountEgp)}
                      <div className="text-xs text-ink-400">{formatEgp(Math.round(o.amountEgp * 1.14))} incl. VAT</div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={o.status === "PAID" ? "green" : o.status === "PENDING" ? "amber" : "neutral"}>{o.status.toLowerCase()}</Badge>
                      {o.paidAt && <div className="mt-0.5 text-xs text-ink-400">{formatDate(o.paidAt)}</div>}
                    </td>
                    <td className="px-5 py-3">
                      {o.status === "PENDING" && (
                        <div className="flex justify-end gap-2">
                          <form action={markPaidAction}>
                            <input type="hidden" name="orderId" value={o.id} />
                            <ConfirmButton tone="primary" confirm={`Mark ${o.item} for ${o.account.owner.email} as PAID? This activates it and adds ${o.credits.toLocaleString("en-US")} credits.`}>Mark paid</ConfirmButton>
                          </form>
                          <form action={cancelOrderAction}>
                            <input type="hidden" name="orderId" value={o.id} />
                            <ConfirmButton tone="danger" confirm="Cancel this order?">Cancel</ConfirmButton>
                          </form>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
