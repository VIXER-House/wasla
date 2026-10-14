import { CheckCircle2, Clock } from "lucide-react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { formatEgp } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { getOrder } from "../actions";

export const dynamic = "force-dynamic";

export default async function OrderDonePage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const user = await requireUser();
  const order = await getOrder((await searchParams).order ?? "", user.account.id);
  if (!order) notFound();
  const paid = order.status === "PAID";
  return (
    <Card className="mx-auto max-w-lg p-8 text-center">
      {paid ? <CheckCircle2 className="mx-auto h-12 w-12 text-brand-600" /> : <Clock className="mx-auto h-12 w-12 text-amber-500" />}
      <h1 className="mt-4 text-2xl font-semibold">{paid ? "Payment received" : "Order received"}</h1>
      <p className="mt-2 text-sm leading-6 text-ink-600">
        {paid
          ? `${order.item} is active. ${order.credits ? `${order.credits.toLocaleString("en-US")} credits were added to your balance.` : ""}`
          : `We've recorded your order for ${order.item} (${formatEgp(order.amountEgp)} + VAT). Our team will contact you at ${user.email} to complete payment and activate it.`}
      </p>
      <p className="mt-2 font-mono text-xs text-ink-400">Order {order.id}</p>
      <div className="mt-6 flex justify-center gap-3">
        <LinkButton href="/dashboard/billing">Go to billing</LinkButton>
        <LinkButton href="/dashboard" variant="outline">Dashboard</LinkButton>
      </div>
    </Card>
  );
}
