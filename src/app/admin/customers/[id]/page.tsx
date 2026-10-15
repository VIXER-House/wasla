import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PLAN_BY_ID } from "@/lib/plans";
import { formatDate, formatEgp, formatNumber, relativeTime } from "@/lib/utils";
import { getCustomer } from "@/server/services/admin.service";
import { isWhatsAppConnected } from "@/server/services/whatsapp.service";
import { Stat } from "@/components/dashboard/page-title";
import { Badge, Card, CardHeader } from "@/components/ui/card";
import { Alert, Input } from "@/components/ui/form";
import { blockAction, revokeKeysAction, setAdminAction } from "../../actions";
import { ConfirmButton } from "../../confirm-button";
import { CreditsForm, PlanForm } from "./forms";

export default async function AdminCustomer({ params }: { params: Promise<{ id: string }> }) {
  const data = await getCustomer((await params).id);
  if (!data) notFound();
  const { account: a, usage30, logs } = data;
  const u = Object.fromEntries(usage30.map((x) => [x.kind, x]));
  const activeKeys = a.apiKeys.filter((k) => !k.revokedAt).length;
  return (
    <>
      <Link href="/admin/customers" className="mb-4 inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900"><ArrowLeft className="h-4 w-4" /> Customers</Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{a.owner.name}</h1>
          <p className="text-sm text-ink-500">{a.owner.email} · {a.name} · joined {formatDate(a.owner.createdAt)}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone={a.plan === "FREE" ? "neutral" : "green"}>{PLAN_BY_ID[a.plan].name}</Badge>
            {a.owner.emailVerifiedAt ? <Badge tone="blue">email confirmed</Badge> : <Badge tone="amber">email not confirmed</Badge>}
            {isWhatsAppConnected(a) && <Badge tone="green">WhatsApp connected</Badge>}
            {a.blockedAt && <Badge tone="red">blocked</Badge>}
            {a.owner.isAdmin && <Badge tone="blue">admin</Badge>}
          </div>
        </div>
      </div>
      {a.blockedAt && <Alert tone="error" className="mb-6">Blocked {formatDate(a.blockedAt, true)}{a.blockedReason ? ` — ${a.blockedReason}` : ""}. API calls are refused.</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Credits" value={formatNumber(a.credits)} />
        <Stat label="Messages · 30d" value={formatNumber((u.MESSAGE_SENT?._count._all ?? 0) + (u.MESSAGE_RECEIVED?._count._all ?? 0))} hint={`${u.MESSAGE_SENT?._count._all ?? 0} sent · ${u.MESSAGE_RECEIVED?._count._all ?? 0} received`} />
        <Stat label="AI replies · 30d" value={formatNumber(u.AI_REQUEST?._count._all ?? 0)} hint={`${formatNumber((u.AI_REQUEST?._sum.tokensIn ?? 0) + (u.AI_REQUEST?._sum.tokensOut ?? 0))} tokens`} />
        <Stat label="Active API keys" value={activeKeys} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Adjust credits" description="Positive adds, negative removes." />
          <div className="p-5"><CreditsForm accountId={a.id} /></div>
        </Card>
        <Card>
          <CardHeader title="Plan" description={a.planRenewsAt ? `Renews ${formatDate(a.planRenewsAt)}` : undefined} />
          <div className="p-5"><PlanForm accountId={a.id} plan={a.plan} /></div>
        </Card>
        <Card>
          <CardHeader title="Access" />
          <div className="space-y-4 p-5">
            {a.blockedAt ? (
              <form action={blockAction}>
                <input type="hidden" name="accountId" value={a.id} />
                <input type="hidden" name="block" value="0" />
                <ConfirmButton tone="primary" confirm="Unblock this account? Their API keys will work again.">Unblock account</ConfirmButton>
              </form>
            ) : (
              <form action={blockAction} className="space-y-2">
                <input type="hidden" name="accountId" value={a.id} />
                <input type="hidden" name="block" value="1" />
                <Input name="reason" placeholder="Reason (optional)" />
                <ConfirmButton tone="danger" confirm="Block this account? All its API calls will be refused until you unblock it.">Block account</ConfirmButton>
              </form>
            )}
            {a.owner.emailVerifiedAt && (
              <form action={setAdminAction} className="border-t border-ink-100 pt-4">
                <input type="hidden" name="accountId" value={a.id} />
                <input type="hidden" name="userId" value={a.owner.id} />
                <input type="hidden" name="admin" value={a.owner.isAdmin ? "0" : "1"} />
                <ConfirmButton confirm={a.owner.isAdmin ? `Remove admin access from ${a.owner.email}?` : `Give ${a.owner.email} full admin access?`}>
                  {a.owner.isAdmin ? "Remove admin access" : "Make admin"}
                </ConfirmButton>
              </form>
            )}
            <form action={revokeKeysAction} className="border-t border-ink-100 pt-4">
              <input type="hidden" name="accountId" value={a.id} />
              <ConfirmButton tone="danger" confirm={`Revoke all ${activeKeys} active API keys? The customer must create new ones.`}>Revoke all API keys ({activeKeys})</ConfirmButton>
            </form>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="API keys" />
          <ul className="divide-y divide-ink-100 text-sm">
            {a.apiKeys.length === 0 && <li className="px-5 py-6 text-center text-ink-500">No keys.</li>}
            {a.apiKeys.map((k) => (
              <li key={k.id} className={`flex items-center justify-between px-5 py-2.5 ${k.revokedAt ? "text-ink-400" : ""}`}>
                <span>{k.name} <span className="font-mono text-xs">{k.prefix}…</span></span>
                <span className="flex items-center gap-2 text-xs">
                  <Badge tone={k.mode === "LIVE" ? "green" : "amber"}>{k.mode.toLowerCase()}</Badge>
                  {k.revokedAt ? "revoked" : k.lastUsedAt ? relativeTime(k.lastUsedAt) : "never used"}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Orders" />
          <ul className="divide-y divide-ink-100 text-sm">
            {a.orders.length === 0 && <li className="px-5 py-6 text-center text-ink-500">No orders.</li>}
            {a.orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between px-5 py-2.5">
                <span>{o.item} <span className="text-xs text-ink-500">· {formatDate(o.createdAt)} · {formatEgp(o.amountEgp)}</span></span>
                <Badge tone={o.status === "PAID" ? "green" : o.status === "PENDING" ? "amber" : "neutral"}>{o.status.toLowerCase()}</Badge>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Credit history" />
          <ul className="divide-y divide-ink-100 text-sm">
            {a.transactions.length === 0 && <li className="px-5 py-6 text-center text-ink-500">None.</li>}
            {a.transactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                <span className="min-w-0 truncate">{t.reason} <span className="text-xs text-ink-500">· {formatDate(t.createdAt, true)}</span></span>
                <span className={`shrink-0 font-medium num ${t.amount > 0 ? "text-brand-700" : ""}`}>{t.amount > 0 ? "+" : ""}{formatNumber(t.amount)}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Admin actions on this account" />
          <ul className="divide-y divide-ink-100 text-sm">
            {logs.length === 0 && <li className="px-5 py-6 text-center text-ink-500">None.</li>}
            {logs.map((l) => (
              <li key={l.id} className="px-5 py-2.5">
                <div>{l.detail}</div>
                <div className="text-xs text-ink-500">{l.adminEmail} · {formatDate(l.createdAt, true)}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
