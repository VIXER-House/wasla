import { Logo } from "@/components/logo";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Logo />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-ink-500">The page you&apos;re looking for doesn&apos;t exist or was moved.</p>
      <div className="mt-2 flex gap-3">
        <LinkButton href="/">Home</LinkButton>
        <LinkButton href="/docs" variant="outline">Docs</LinkButton>
      </div>
    </div>
  );
}
