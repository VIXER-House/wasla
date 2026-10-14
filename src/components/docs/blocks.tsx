import { cn } from "@/lib/utils";

export function Endpoint({ method, path }: { method: "GET" | "POST"; path: string }) {
  return (
    <div className="my-4 flex items-center gap-3 rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 font-mono text-sm">
      <span className={cn("rounded px-1.5 py-0.5 text-xs font-bold", method === "GET" ? "bg-sky-100 text-sky-800" : "bg-brand-100 text-brand-800")}>{method}</span>
      <span className="text-ink-900">{path}</span>
    </div>
  );
}

export function Params({ rows }: { rows: [name: string, type: string, desc: React.ReactNode, required?: boolean][] }) {
  return (
    <table>
      <thead>
        <tr><th>Field</th><th>Type</th><th>Description</th></tr>
      </thead>
      <tbody>
        {rows.map(([n, t, d, r]) => (
          <tr key={n}>
            <td className="whitespace-nowrap"><code>{n}</code>{r && <span className="ml-1 text-xs text-red-600">required</span>}</td>
            <td className="whitespace-nowrap text-ink-500">{t}</td>
            <td>{d}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Note({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "warning" }) {
  return <div className={cn("my-4 rounded-lg border px-4 py-3 text-sm leading-6", tone === "info" ? "border-sky-200 bg-sky-50 text-sky-900" : "border-amber-200 bg-amber-50 text-amber-900")}>{children}</div>;
}
