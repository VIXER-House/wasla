import Link from "next/link";
import { Bot, Coins, KeyRound, MessageCircle, Send, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PLAN_BY_ID } from "@/lib/plans";
import { formatDate, formatNumber, relativeTime } from "@/lib/utils";
import { dailyUsage, sumUsage } from "@/server/services/usage.service";
import { isWhatsAppConnected } from "@/server/services/whatsapp.service";
import { PageTitle, Stat } from "@/components/dashboard/page-title";
import { BarChart } from "@/components/dashboard/bar-chart";
import { Badge, Card, CardHeader } from "@/components/ui/card";
import { Alert } from "@/components/ui/form";
import { LinkButton } from "@/components/ui/button";
import { CodeBlock } from "@/components/code-block";

const KIND_LABEL = { MESSAGE_SENT: "Message sent", MESSAGE_RECEIVED: "Message received", AI_REQUEST: "AI reply" } as const;

export default async function DashboardHome({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await requireUser();
  const a = user.account;
  const sp = await searchParams;
  const [daily, keys, recent] = await Promise.all([
    dailyUsage(a.id, 30),
    db.apiKey.count({ where: { accountId: a.id, revokedAt: null } }),
    db.usageEvent.findMany({ where: { accountId: a.id }, orderBy: { createdAt: "desc" }, take: 8, include: { apiKey: { select: { name: true } } } }),
  ]);
  const t = sumUsage(daily);
  const plan = PLAN_BY_ID[a.plan];
  const checklist = [
    { done: keys > 0, label: "Create an API key", href: "/dashboard/api-keys" },
    { done: recent.length > 0, label: "Make your first API call", href: "/docs/quickstart" },
    { done: isWhatsAppConnected(a), label: "Connect your WhatsApp number", href: "/dashboard/whatsapp" },
  ];

  return (
    <>
      <PageTitle title={`Hi ${user.name.split(" ")[0]} 👋`} description={a.name} actions={<LinkButton href="/dashboard/api-keys" size="sm"><KeyRound /> New API key</LinkButton>} />
      {sp.welcome && (
        <Alert tone="success" className="mb-6">
          <Sparkles className="mr-1 inline h-4 w-4" /> Your email is confirmed and your welcome credits are in your balance. Create a test key to start building.
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Credit balance" value={formatNumber(a.credits)} icon={Coins} hint={<Link href="/dashboard/billing" className="text-brand-700 hover:underline">Top up →</Link>} />
        <Stat label="Plan" value={plan.name} icon={Sparkles} hint={a.planRenewsAt ? `Renews ${formatDate(a.planRenewsAt)}` : plan.id === "FREE" ? <Link href="/pricing" className="text-brand-700 hover:underline">Upgrade →</Link> : undefined} />
        <Stat label="Messages · 30 days" value={formatNumber(t.messagesSent + t.messagesReceived)} icon={MessageCircle} hint={`${formatNumber(t.messagesSent)} sent · ${formatNumber(t.messagesReceived)} received`} />
        <Stat label="AI · 30 days" value={formatNumber(t.aiRequests)} icon={Bot} hint={`${formatNumber(t.aiTokens)} tokens`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader title="Credits used" description="Last 30 days" actions={<Link href="/dashboard/usage" className="text-sm text-brand-700 hover:underline">Details</Link>} />
          <div className="p-5">
            <BarChart data={daily.map((d) => ({ day: d.day, value: d.credits }))} label="Credits used" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Get started" />
          <ul className="divide-y divide-ink-100">
            {checklist.map((c) => (
              <li key={c.label}>
                <Link href={c.href} className="flex items-center gap-3 px-5 py-3.5 text-sm hover:bg-ink-50">
                  <span className={c.done ? "grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-[11px] text-white" : "h-5 w-5 rounded-full border-2 border-ink-200"}>{c.done ? "✓" : ""}</span>
                  <span className={c.done ? "text-ink-400 line-through" : "text-ink-800"}>{c.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recent activity" />
          {recent.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-ink-500">No API calls yet.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {recent.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-medium text-ink-900">
                      {e.kind === "AI_REQUEST" ? <Bot className="h-4 w-4 text-violet-600" /> : <Send className="h-4 w-4 text-brand-600" />}
                      {KIND_LABEL[e.kind]}
                      {e.mode === "TEST" && <Badge tone="amber">test</Badge>}
                      {!e.ok && <Badge tone="red">failed</Badge>}
                    </div>
                    <div className="truncate text-xs text-ink-500">{[e.apiKey?.name, e.detail].filter(Boolean).join(" · ")}</div>
                  </div>
                  <div className="shrink-0 text-right text-xs text-ink-500">
                    <div className="num">{e.credits ? `−${e.credits} cr` : "free"}</div>
                    <div>{relativeTime(e.createdAt)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <CardHeader title="Try it" description="Check your key and balance from a terminal." />
          <div className="px-5 pb-2">
            <CodeBlock code={`curl ${process.env.APP_URL ?? "https://YOUR-DOMAIN"}/api/v1/account \\\n  -H "Authorization: Bearer YOUR_API_KEY"`} />
          </div>
        </Card>
      </div>
    </>
  );
}
