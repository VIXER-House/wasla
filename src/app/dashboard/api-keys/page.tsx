import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PLAN_BY_ID } from "@/lib/plans";
import { formatDate, relativeTime } from "@/lib/utils";
import { PageTitle } from "@/components/dashboard/page-title";
import { Badge, Card, CardHeader } from "@/components/ui/card";
import { CreateKeyCard, RevokeButton } from "./client";

export default async function ApiKeysPage() {
  const user = await requireUser();
  const keys = await db.apiKey.findMany({ where: { accountId: user.account.id }, orderBy: [{ revokedAt: { sort: "asc", nulls: "first" } }, { createdAt: "desc" }] });
  const active = keys.filter((k) => !k.revokedAt).length;
  const max = PLAN_BY_ID[user.account.plan].maxApiKeys;
  return (
    <>
      <PageTitle title="API keys" description="Keys authenticate your server's calls to the API. Keep them secret — never put them in a website or mobile app." />
      <CreateKeyCard atLimit={active >= max} limitText={`${active} of ${max} active keys on your plan`} />
      <Card className="mt-6">
        <CardHeader title="Your keys" description="Test keys simulate sending and AI for free. Live keys use credits." />
        {keys.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink-500">No keys yet — create your first one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Name</th>
                  <th className="px-5 py-2.5 font-medium">Key</th>
                  <th className="px-5 py-2.5 font-medium">Mode</th>
                  <th className="px-5 py-2.5 font-medium">Created</th>
                  <th className="px-5 py-2.5 font-medium">Last used</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {keys.map((k) => (
                  <tr key={k.id} className={k.revokedAt ? "text-ink-400" : ""}>
                    <td className="px-5 py-3 font-medium">{k.name}</td>
                    <td className="px-5 py-3 font-mono text-xs">{k.prefix}…</td>
                    <td className="px-5 py-3">{k.mode === "LIVE" ? <Badge tone="green">live</Badge> : <Badge tone="amber">test</Badge>}</td>
                    <td className="px-5 py-3 text-ink-500">{formatDate(k.createdAt)}</td>
                    <td className="px-5 py-3 text-ink-500">{k.lastUsedAt ? relativeTime(k.lastUsedAt) : "Never"}</td>
                    <td className="px-5 py-3 text-right">{k.revokedAt ? <Badge tone="neutral">revoked</Badge> : <RevokeButton id={k.id} name={k.name} />}</td>
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
