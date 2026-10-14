import { cn } from "@/lib/utils";

export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-ink-200 bg-white shadow-sm", className)} {...p} />;
}
export function CardHeader({ title, description, actions, className }: { title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3 border-b border-ink-100 px-5 py-4", className)}>
      <div>
        <h2 className="text-[15px] font-semibold text-ink-950">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
export function Badge({ tone = "neutral", className, ...p }: { tone?: "neutral" | "green" | "amber" | "red" | "blue" } & React.HTMLAttributes<HTMLSpanElement>) {
  const t = { neutral: "bg-ink-100 text-ink-700", green: "bg-brand-50 text-brand-700 ring-brand-200", amber: "bg-amber-50 text-amber-800 ring-amber-200", red: "bg-red-50 text-red-700 ring-red-200", blue: "bg-sky-50 text-sky-700 ring-sky-200" }[tone];
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-transparent", t, className)} {...p} />;
}
