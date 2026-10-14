import type { Metadata } from "next";
import { Check } from "lucide-react";
import { COSTS, CREDIT_PACKS, PLANS, TRIAL_CREDITS } from "@/lib/plans";
import { BRAND } from "@/lib/brand";
import { cn, formatEgp, formatNumber } from "@/lib/utils";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="py-16 md:py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-ink-950">Pricing</h1>
          <p className="mt-4 text-lg text-ink-600">Pay monthly for a bundle of credits. Top up whenever you need more. Prices in Egyptian pounds.</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => (
            <div key={p.id} className={cn("relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm", p.highlight ? "border-brand-500 ring-1 ring-brand-500" : "border-ink-200")}>
              {p.highlight && <span className="absolute -top-3 left-6 rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-medium text-white">Most popular</span>}
              <h2 className="text-lg font-semibold text-ink-950">{p.name}</h2>
              <p className="mt-1 min-h-[40px] text-sm text-ink-500">{p.blurb}</p>
              <div className="mt-5">
                {p.priceEgp === null ? (
                  <span className="text-3xl font-semibold text-ink-950">Custom</span>
                ) : (
                  <>
                    <span className="num text-4xl font-semibold tracking-tight text-ink-950">{formatNumber(p.priceEgp)}</span>
                    <span className="ml-1 text-sm text-ink-500">EGP / month</span>
                  </>
                )}
              </div>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm text-ink-700">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {p.id === "FREE" ? (
                  <LinkButton href="/signup" variant="outline" className="w-full">Start free</LinkButton>
                ) : p.priceEgp === null ? (
                  <LinkButton href={`mailto:${BRAND.supportEmail}?subject=${encodeURIComponent(`${BRAND.name} Business plan`)}`} variant="outline" className="w-full">Contact sales</LinkButton>
                ) : (
                  <LinkButton href={`/checkout?plan=${p.id.toLowerCase()}`} variant={p.highlight ? "primary" : "dark"} className="w-full">Choose {p.name}</LinkButton>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-ink-200 p-6">
            <h2 className="text-lg font-semibold text-ink-950">What a credit buys</h2>
            <table className="mt-4 w-full text-sm">
              <tbody className="divide-y divide-ink-100">
                <tr><td className="py-2.5 text-ink-700">Send a WhatsApp message</td><td className="py-2.5 text-right font-medium num">{COSTS.messageSent} credit</td></tr>
                <tr><td className="py-2.5 text-ink-700">Receive a message (forwarded to your webhook)</td><td className="py-2.5 text-right font-medium text-brand-700">Free</td></tr>
                <tr><td className="py-2.5 text-ink-700">AI reply — per started 1,000 tokens</td><td className="py-2.5 text-right font-medium num">{COSTS.aiPer1kTokens} credit</td></tr>
                <tr><td className="py-2.5 text-ink-700">Any call with a test key (wk_test_…)</td><td className="py-2.5 text-right font-medium text-brand-700">Free</td></tr>
              </tbody>
            </table>
            <p className="mt-4 text-xs leading-5 text-ink-500">
              A typical AI reply to a WhatsApp message uses 300–800 tokens, so 1 credit. New accounts get {TRIAL_CREDITS} credits after confirming their email.
              Meta&apos;s own WhatsApp conversation fees are billed by Meta to your WhatsApp Business account.
            </p>
          </div>
          <div className="rounded-2xl border border-ink-200 p-6">
            <h2 className="text-lg font-semibold text-ink-950">Top-up packs</h2>
            <p className="mt-1 text-sm text-ink-500">One-off credits that never expire, on any plan.</p>
            <div className="mt-4 divide-y divide-ink-100">
              {CREDIT_PACKS.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-ink-900 num">{formatNumber(c.credits)} credits</div>
                    <div className="text-xs text-ink-500">{(c.priceEgp / c.credits * 1000).toFixed(0)} EGP per 1,000</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold num">{formatEgp(c.priceEgp)}</span>
                    <LinkButton href={`/checkout?pack=${c.id}`} size="sm" variant="outline">Buy</LinkButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
