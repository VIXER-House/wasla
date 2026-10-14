"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CodeBlock({ code, title, className }: { code: string; title?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={cn("group relative my-4 overflow-hidden rounded-xl border border-ink-800 bg-ink-950", className)}>
      {title && <div className="border-b border-ink-800 px-4 py-2 font-mono text-xs text-ink-400">{title}</div>}
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
        className="absolute right-2.5 top-2.5 rounded-md border border-ink-700 bg-ink-900 p-1.5 text-ink-300 opacity-0 transition hover:text-white group-hover:opacity-100 focus:opacity-100"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6 text-ink-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function CopyText({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })}
      className={cn("inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-2 py-1 text-xs font-medium text-ink-700 hover:bg-ink-50", className)}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-brand-600" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy"}
    </button>
  );
}
