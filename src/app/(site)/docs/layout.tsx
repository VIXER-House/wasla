import { DocsPager, DocsSidebar } from "@/components/docs/sidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container grid gap-10 py-10 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto">
        <DocsSidebar />
      </aside>
      <article className="prose-docs min-w-0 max-w-3xl">
        {children}
        <DocsPager />
      </article>
    </div>
  );
}
