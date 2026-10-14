import Link from "next/link";
import { ArrowRight, BadgeCheck, Bot, Building2, CalendarClock, Code2, Gauge, KeyRound, Languages, LifeBuoy, Mic, ShieldCheck, Stethoscope, UtensilsCrossed, Webhook } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { PLANS } from "@/lib/plans";
import { formatNumber } from "@/lib/utils";
import { LinkButton } from "@/components/ui/button";
import { CodeBlock } from "@/components/code-block";

const SEND_EXAMPLE = `curl https://YOUR-DOMAIN/api/v1/messages \\
  -H "Authorization: Bearer wk_live_…" \\
  -H "Content-Type: application/json" \\
  -d '{ "to": "+201001234567", "text": "Your request MAINT-000123 is logged ✅" }'`;

const STEPS = [
  { icon: KeyRound, title: "Create an API key", body: "Sign up, confirm your email and create a key. Test keys work instantly — no WhatsApp number needed." },
  { icon: BadgeCheck, title: "Connect your WhatsApp number", body: "Use the official WhatsApp Business Platform. Paste your number ID and token once; we keep them encrypted." },
  { icon: Code2, title: "Send, receive, reply with AI", body: "One HTTPS call to send. Incoming messages reach your webhook, signed. Ask the AI for the next reply." },
];

const FEATURES = [
  { icon: ShieldCheck, title: "Official WhatsApp API", body: "Built on Meta's WhatsApp Business Platform — no unofficial clients, no banned numbers." },
  { icon: Languages, title: "Arabic & English AI", body: "Replies in Egyptian Arabic or English, matching the customer. You give the instructions, the AI writes the message." },
  { icon: Webhook, title: "Signed webhooks", body: "Every incoming message and delivery receipt is forwarded to your server with an HMAC signature." },
  { icon: Gauge, title: "Credits & live usage", body: "Pay for what you use. See messages, AI tokens and credits per day in your dashboard." },
  { icon: Bot, title: "Test mode", body: "wk_test_ keys simulate sending and AI replies for free, so you can build before you go live." },
  { icon: Mic, title: "Voice notes & media", body: "Receive images, documents and voice notes; transcription for Arabic voice notes is on the way." },
];

const USE_CASES = [
  { icon: Building2, title: "Property & maintenance", body: "Residents report issues on WhatsApp, tickets open automatically and technicians get the job. Already powering MaintenanceOS." },
  { icon: UtensilsCrossed, title: "Restaurants & bookings", body: "Take reservations and orders in chat, confirm instantly and send reminders before the table time." },
  { icon: Stethoscope, title: "Clinics", body: "Book, confirm and reschedule appointments, and answer common questions without tying up reception." },
  { icon: LifeBuoy, title: "Support & inquiries", body: "Answer FAQs around the clock with AI and hand over to a human when it matters." },
];

const FAQ = [
  ["Do I need my own WhatsApp number?", "Yes, for live messages. You connect a number registered on Meta's WhatsApp Business Platform. Until then, test keys let you build and try everything."],
  ["How do credits work?", "Sending a message costs 1 credit. AI replies cost 1 credit per started 1,000 tokens. Receiving messages is free. Test-mode calls never use credits."],
  ["Who pays Meta's WhatsApp fees?", "Meta bills its own conversation fees directly to the WhatsApp Business account you connect. Our credits cover the API and the AI."],
  ["Is my data safe?", "Access tokens are encrypted at rest, API keys are stored only as hashes, and webhooks are signed so you can verify they came from us."],
  ["Which languages do you support?", "The AI understands and writes Egyptian Arabic, Modern Standard Arabic and English, and answers in the customer's language."],
];

function ChatMock() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-brand-200/60 via-brand-50 to-transparent blur-2xl" />
      <div className="overflow-hidden rounded-[1.75rem] border border-ink-200 bg-white shadow-xl">
        <div className="flex items-center gap-3 bg-[#008069] px-4 py-3 text-white">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-sm font-semibold">PH</div>
          <div>
            <div className="text-sm font-semibold">Palm Hills Maintenance</div>
            <div className="text-[11px] text-white/80">Business account</div>
          </div>
        </div>
        <div className="space-y-2 bg-[#efeae2] p-4 text-[13px] leading-6">
          <div dir="rtl" className="ml-auto w-fit max-w-[80%] rounded-lg rounded-tr-none bg-[#d9fdd3] px-3 py-1.5 text-ink-900 shadow-sm">الحنفية بتنقط في المطبخ من امبارح</div>
          <div dir="rtl" className="mr-auto w-fit max-w-[85%] rounded-lg rounded-tl-none bg-white px-3 py-1.5 text-ink-900 shadow-sm">
            تمام، سجلت طلب صيانة رقم MAINT-000123 ✅
            <br />
            التصنيف: سباكة — الأولوية: متوسطة
            <br />
            الفني أحمد هيكون عندك خلال 8 ساعات.
          </div>
          <div dir="rtl" className="ml-auto w-fit max-w-[60%] rounded-lg rounded-tr-none bg-[#d9fdd3] px-3 py-1.5 text-ink-900 shadow-sm">شكراً 🙏</div>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-6 hidden rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs shadow-lg sm:block">
        <div className="font-mono text-[11px] text-ink-500">POST /api/v1/ai/reply</div>
        <div className="mt-0.5 font-medium text-brand-700">200 OK · 412 tokens · 1 credit</div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-brand-50/70 to-white" />
        <div className="container grid items-center gap-14 py-16 md:py-24 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-brand-800">
              <BadgeCheck className="h-3.5 w-3.5" /> Official WhatsApp Business Platform
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight text-ink-950 sm:text-5xl">
              WhatsApp + AI for your product, <span className="text-brand-600">through one API.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-ink-600">{BRAND.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/signup" size="lg">
                Start free <ArrowRight />
              </LinkButton>
              <LinkButton href="/docs/quickstart" size="lg" variant="outline">
                Read the quickstart
              </LinkButton>
            </div>
            <p className="mt-4 text-sm text-ink-500">200 free credits · unlimited test-mode calls · no card needed</p>
          </div>
          <ChatMock />
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-ink-100 bg-white py-16">
        <div className="container">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-brand-700">How it works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="rounded-xl border border-ink-100 bg-ink-50/50 p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">{i + 1}</span>
                  <s.icon className="h-5 w-5 text-brand-700" />
                </div>
                <h3 className="mt-4 font-semibold text-ink-950">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-ink-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 py-20">
        <div className="container">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-ink-950">Everything you need to run conversations on WhatsApp</h2>
            <p className="mt-3 text-ink-600">Skip months of Meta integration work, webhook plumbing and AI prompt tuning.</p>
          </div>
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-ink-950">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-ink-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code */}
      <section className="bg-ink-950 py-20 text-white">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">One call to send. One webhook to receive.</h2>
            <p className="mt-4 leading-7 text-ink-300">
              Plain HTTPS and JSON — works from Node.js, PHP, Python, Laravel, .NET or no-code tools. For Node.js there&apos;s also our typed library.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-ink-300">
              <li className="flex gap-2"><CalendarClock className="h-4 w-4 shrink-0 text-brand-400" /> Delivery receipts: sent, delivered, read, failed</li>
              <li className="flex gap-2"><Webhook className="h-4 w-4 shrink-0 text-brand-400" /> Incoming messages forwarded and signed</li>
              <li className="flex gap-2"><Bot className="h-4 w-4 shrink-0 text-brand-400" /> AI replies billed by actual tokens used</li>
            </ul>
            <LinkButton href="/docs/api/messages" variant="outline" className="mt-8 border-ink-700 bg-transparent text-white hover:bg-ink-800">
              API reference <ArrowRight />
            </LinkButton>
          </div>
          <CodeBlock code={SEND_EXAMPLE} title="Send a WhatsApp message" className="my-0" />
        </div>
      </section>

      {/* Use cases */}
      <section id="use-cases" className="scroll-mt-20 py-20">
        <div className="container">
          <h2 className="text-3xl font-semibold tracking-tight text-ink-950">Built for real businesses</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {USE_CASES.map((u) => (
              <div key={u.title} className="flex gap-4 rounded-xl border border-ink-200 p-6">
                <u.icon className="mt-0.5 h-6 w-6 shrink-0 text-brand-600" />
                <div>
                  <h3 className="font-semibold text-ink-950">{u.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-ink-600">{u.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="border-y border-ink-100 bg-ink-50/60 py-16">
        <div className="container flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink-950">Simple monthly plans, priced in EGP</h2>
            <p className="mt-2 text-ink-600">
              From free to {formatNumber(PLANS.find((p) => p.id === "GROWTH")!.monthlyCredits)} credits a month — top up any time.
            </p>
          </div>
          <LinkButton href="/pricing" size="lg" variant="dark">
            See pricing <ArrowRight />
          </LinkButton>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-tight text-ink-950">Questions</h2>
          <div className="mt-8 divide-y divide-ink-100 border-y border-ink-100">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-ink-900">
                  {q}
                  <span className="text-ink-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm leading-6 text-ink-600">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="container">
          <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 px-8 py-12 text-center text-white">
            <h2 className="text-3xl font-semibold tracking-tight">Start building in minutes</h2>
            <p className="mx-auto mt-3 max-w-xl text-brand-100">Create a free account, grab a test key and send your first message from the docs.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <LinkButton href="/signup" size="lg" className="bg-white text-brand-800 hover:bg-brand-50">Create free account</LinkButton>
              <Link href="/docs" className="inline-flex h-12 items-center px-4 font-medium text-white/90 hover:text-white">Browse the docs →</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
