import Link from "next/link";
import { PLAN_BY_ID } from "@/lib/plans";
import { formatDate, formatNumber } from "@/lib/utils";
import { listCustomers } from "@/server/services/admin.service";
import { PageTitle } from "@/components/dashboard/page-title";
import { Badge, Card } from "@/components/ui/card";
import { Input } from "@/components/ui/form";

const FILTERS = [["", "All"], ["paid", "Paid"], ["blocked", "Blocked"], ["unverified", "Unconfirmed"]] as const;

export default async function AdminCustomers({ searchParams }: { searchParams: Promise<{ q?: string; filter?: string; page?: string }> }) {
  const sp = await searchParams;
  const { rows, total, page, pages } = await listCustomers({ q: sp.q, filter: sp.filter, page: Number(sp.page) || 1 });
  const qs = (over: Record<string, string>) => `?${new URLSearchParams({ ...(sp.q ? { q: sp.q } : {}), ...(sp.filter ? { filter: sp.filter } : {}), ...over })}`;
  return (
    <>
      <PageTitle title="Customers" description={`${formatNumber(total)} account${total === 1 ? "" : "s"}`} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form className="flex-1 min-w-[240px]">
          {sp.filter && <input type="hidden" name="filter" value={sp.filter} />}
          <Input name="q" defaultValue={sp.q} placeholder="Search by email, name or workspace…" />
        </form>
        <div className="flex rounded-lg border border-ink-200 bg-white p-0.5 text-sm">
          {FILTERS.map(([v, l]) => (
            <Link key={v} href={`?${new URLSearchParams({ ...(sp.q ? { q: sp.q } : {}), ...(v ? { filter: v } : {}) })}`} className={(sp.filter ?? "") === v ? "rounded-md bg-ink-900 px-3 py-1 text-white" : "rounded-md px-3 py-1 text-ink-600 hover:bg-ink-50"}>
              {l}
            </Link>
          ))}
        </div>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-2.5 font-medium">Customer</th>
                <th className="px-5 py-2.5 font-medium">Plan</th>
                <th className="px-5 py-2.5 text-right font-medium">Credits</th>
                <th className="px-5 py-2.5 text-right font-medium">Keys</th>
                <th className="px-5 py-2.5 text-right font-medium">API calls</th>
                <th className="px-5 py-2.5 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((a) => (
                <tr key={a.id} className="hover:bg-ink-50/60">
                  <td className="px-5 py-3">
                    <Link href={`/admin/customers/${a.id}`} className="font-medium text-ink-900 hover:text-brand-700">{a.owner.name}</Link>
                    <div className="text-xs text-ink-500">{a.owner.email}</div>
                    <div className="mt-1 flex gap-1">
                      {!a.owner.emailVerifiedAt && <Badge tone="amber">unconfirmed</Badge>}
                      {a.blockedAt && <Badge tone="red">blocked</Badge>}
                    </div>
                  </td>
                  <td className="px-5 py-3">{PLAN_BY_ID[a.plan].name}</td>
                  <td className="px-5 py-3 text-right num">{formatNumber(a.credits)}</td>
                  <td className="px-5 py-3 text-right num">{a._count.apiKeys}</td>
                  <td className="px-5 py-3 text-right num">{formatNumber(a._count.usage)}</td>
                  <td className="px-5 py-3 text-ink-500">{formatDate(a.createdAt)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-ink-500">No customers match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-ink-500">Page {page} of {pages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={qs({ page: String(page - 1) })} className="rounded-md border border-ink-200 bg-white px-3 py-1 hover:bg-ink-50">Previous</Link>}
            {page < pages && <Link href={qs({ page: String(page + 1) })} className="rounded-md border border-ink-200 bg-white px-3 py-1 hover:bg-ink-50">Next</Link>}
          </div>
        </div>
      )}
    </>
  );
}
