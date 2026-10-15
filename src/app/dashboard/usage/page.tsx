import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatNumber } from "@/lib/utils";
import { dailyUsage, sumUsage } from "@/server/services/usage.service";
import { PageTitle, Stat } from "@/components/dashboard/page-title";
import { BarChart } from "@/components/dashboard/bar-chart";
import { Badge, Card, CardHeader } from "@/components/ui/card";

const KIND_LABEL = { MESSAGE_SENT: "Message sent", MESSAGE_RECEIVED: "Message received", AI_REQUEST: "AI reply" } as const;

export default async function UsagePage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const user = await requireUser();
  const days = [7, 30, 90].includes(Number((await searchParams).days)) ? Number((await searchParams).days) : 30;
  const [daily, events] = await Promise.all([
    dailyUsage(user.account.id, days),
    db.usageEvent.findMany({ where: { accountId: user.account.id }, orderBy: { createdAt: "desc" }, take: 50, include: { apiKey: { select: { name: true, prefix: true } } } }),
  ]);
  const t = sumUsage(daily);
  return (
    <>
      <PageTitle
        title="Usage"
        description="Messages, AI tokens and credits, per day (UTC)."
        actions={
          <div className="flex rounded-lg border border-ink-200 bg-white p-0.5 text-sm">
            {[7, 30, 90].map((d) => (
              <a key={d} href={`?days=${d}`} className={d === days ? "rounded-md bg-ink-900 px-3 py-1 text-white" : "rounded-md px-3 py-1 text-ink-600 hover:bg-ink-50"}>
                {d}d
              </a>
            ))}
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Messages sent" value={formatNumber(t.messagesSent)} />
        <Stat label="Messages received" value={formatNumber(t.messagesReceived)} />
        <Stat label="AI replies" value={formatNumber(t.aiRequests)} hint={`${formatNumber(t.aiTokens)} tokens`} />
        <Stat label="Credits used" value={formatNumber(t.credits)} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Messages sent" />
          <div className="p-5"><BarChart data={daily.map((d) => ({ day: d.day, value: d.messagesSent }))} label="Messages sent" /></div>
        </Card>
        <Card>
          <CardHeader title="AI tokens" />
          <div className="p-5"><BarChart data={daily.map((d) => ({ day: d.day, value: d.aiTokens }))} label="AI tokens" color="#7c3aed" /></div>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader title="Latest calls" description="The 50 most recent events." />
        {events.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink-500">Nothing yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Time</th>
                  <th className="px-5 py-2.5 font-medium">Event</th>
                  <th className="px-5 py-2.5 font-medium">Key</th>
                  <th className="px-5 py-2.5 font-medium text-right">Tokens</th>
                  <th className="px-5 py-2.5 font-medium text-right">Credits</th>
                  <th className="px-5 py-2.5 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {events.map((e) => (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap px-5 py-2.5 text-ink-500">{formatDate(e.createdAt, "seconds")}</td>
                    <td className="whitespace-nowrap px-5 py-2.5">
                      {KIND_LABEL[e.kind]} {e.mode === "TEST" && <Badge tone="amber">test</Badge>} {!e.ok && <Badge tone="red">failed</Badge>}
                    </td>
                    <td className="px-5 py-2.5 text-ink-600">{e.apiKey ? e.apiKey.name : "—"}</td>
                    <td className="px-5 py-2.5 text-right num text-ink-600">{e.tokensIn + e.tokensOut ? formatNumber(e.tokensIn + e.tokensOut) : "—"}</td>
                    <td className="px-5 py-2.5 text-right num">{e.credits || "—"}</td>
                    <td className="max-w-[260px] truncate px-5 py-2.5 text-ink-500">{e.detail}</td>
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
