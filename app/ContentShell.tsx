import type { ReactNode } from "react";
import { getLatestFx } from "@/lib/fx";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

// Shared frame for static content pages (guides, legal, about). Reuses the
// compact header (brand renders as <span>, so each page's own <h1> is the
// sole heading) and the site footer.
export default async function ContentShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  const { fxUsd, fxEur, fxChf } = await getLatestFx();
  return (
    <main className="min-h-screen">
      <SiteHeader
        fxUsd={fxUsd}
        fxEur={fxEur}
        fxChf={fxChf}
        lastUpdated={null}
        compact
      />
      <article className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="u-display text-[28px] font-medium leading-tight text-[var(--ink)] sm:text-3xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">
            {intro}
          </p>
        )}
        <div className="mt-9">{children}</div>

        <a
          href="/"
          className="u-mono mt-12 inline-block text-[11px] uppercase tracking-wide text-[var(--indigo)] underline underline-offset-2"
        >
          ← 전체 상품 보기
        </a>
      </article>
      <SiteFooter />
    </main>
  );
}
