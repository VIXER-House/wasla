import type { Metadata } from "next";
import { CreditCard, Info } from "lucide-react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getConfig } from "@/lib/config";
import { formatEgp, formatNumber } from "@/lib/utils";
import { resolveItem } from "@/server/services/checkout.service";
import { Card } from "@/components/ui/card";
import { Alert, Field, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/auth-ui";
import { placeOrderAction } from "./actions";

export const metadata: Metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ plan?: string; pack?: string }> }) {
  const sp = await searchParams;
  const query = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]).toString();
  const user = await requireUser(`/checkout?${query}`);
  const item = resolveItem(sp);
  if (!item) redirect("/pricing");
  const testMode = getConfig().CHECKOUT_TEST_MODE;
  const vat = Math.round(item.priceEgp * 0.14);

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Complete your purchase</h1>
        <Card className="p-6">
          <h2 className="font-semibold">Billing details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Name"><Input defaultValue={user.name} readOnly /></Field>
            <Field label="Email"><Input defaultValue={user.email} readOnly /></Field>
            <Field label="Company (optional)"><Input defaultValue={user.account.name} readOnly /></Field>
            <Field label="Country"><Input defaultValue="Egypt" readOnly /></Field>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="flex items-center gap-2 font-semibold"><CreditCard className="h-5 w-5" /> Payment</h2>
          <div className="mt-4 rounded-xl border border-dashed border-ink-300 bg-ink-50 p-5 text-sm text-ink-600">
            <p className="font-medium text-ink-800">Online card payment is coming soon.</p>
            <p className="mt-1">Place your order now and our team will contact you within one business day to activate it (bank transfer, InstaPay or card link).</p>
          </div>
          {testMode && (
            <Alert tone="warning" className="mt-4">
              <Info className="mr-1 inline h-4 w-4" /> Test mode is on: you can simulate a successful payment to try plans and credits.
            </Alert>
          )}
        </Card>
      </div>

      <div>
        <Card className="sticky top-6 p-6">
          <h2 className="font-semibold">Order summary</h2>
          <div className="mt-4 flex items-start justify-between gap-4 text-sm">
            <div>
              <div className="font-medium text-ink-900">{item.name}</div>
              <div className="text-ink-500">{formatNumber(item.credits)} credits{item.kind === "plan" ? " every month" : ", never expire"}</div>
            </div>
            <div className="font-medium num">{formatEgp(item.priceEgp)}</div>
          </div>
          <dl className="mt-5 space-y-2 border-t border-ink-100 pt-4 text-sm">
            <div className="flex justify-between text-ink-600"><dt>Subtotal</dt><dd className="num">{formatEgp(item.priceEgp)}</dd></div>
            <div className="flex justify-between text-ink-600"><dt>VAT (14%)</dt><dd className="num">{formatEgp(vat)}</dd></div>
            <div className="flex justify-between border-t border-ink-100 pt-2 text-base font-semibold"><dt>Total</dt><dd className="num">{formatEgp(item.priceEgp + vat)}</dd></div>
          </dl>
          <form action={placeOrderAction} className="mt-6 space-y-2">
            {"plan" in item && <input type="hidden" name="plan" value={item.plan} />}
            {"id" in item && <input type="hidden" name="pack" value={item.id} />}
            <SubmitButton className="w-full">Place order</SubmitButton>
          </form>
          {testMode && (
            <form action={placeOrderAction} className="mt-2">
              {"plan" in item && <input type="hidden" name="plan" value={item.plan} />}
              {"id" in item && <input type="hidden" name="pack" value={item.id} />}
              <input type="hidden" name="simulate" value="1" />
              <SubmitButton variant="outline" className="w-full">Simulate successful payment (test)</SubmitButton>
            </form>
          )}
          <p className="mt-4 text-xs leading-5 text-ink-500">{item.kind === "plan" ? "Monthly plan — renews every 30 days. Cancel any time." : "One-off purchase."}</p>
        </Card>
      </div>
    </div>
  );
}
