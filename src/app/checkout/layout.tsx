import Link from "next/link";
import { Lock } from "lucide-react";
import { Logo } from "@/components/logo";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-50/60">
      <div className="border-b border-ink-200 bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <span className="flex items-center gap-1.5 text-sm text-ink-500"><Lock className="h-4 w-4" /> Checkout</span>
        </div>
      </div>
      <main className="container py-10">{children}</main>
      <p className="pb-10 text-center text-xs text-ink-400">
        Questions about billing? <Link href="/pricing" className="underline">See pricing</Link>
      </p>
    </div>
  );
}
