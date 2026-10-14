import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-brand-50/60 to-white">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <Link href="/docs" className="text-sm text-ink-500 hover:text-ink-900">Docs</Link>
      </div>
      <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-6 sm:pt-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
