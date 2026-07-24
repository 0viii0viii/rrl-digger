import { getAllRRLProducts } from "@/lib/products";
import { getLatestFx } from "@/lib/fx";
import Explorer from "./Explorer";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

// Static + ISR: render once every 10 min, serve cached HTML from the CDN.
// NOTE: do NOT read searchParams here — that would force per-request dynamic
// rendering (full Supabase fetch on every visit). The ?category= deep link is
// handled client-side in Explorer via window.location instead.
export const revalidate = 600;

export default async function Home() {
  const [products, { fxUsd, fxEur, fxChf }] = await Promise.all([
    getAllRRLProducts(),
    getLatestFx(),
  ]);

  const lastUpdated =
    products.length > 0
      ? products.reduce(
          (max, p) => (p.updated_at > max ? p.updated_at : max),
          products[0].updated_at,
        )
      : null;

  return (
    <main className="min-h-screen">
      <SiteHeader
        fxUsd={fxUsd}
        fxEur={fxEur}
        fxChf={fxChf}
        lastUpdated={lastUpdated}
      />

      <div className="mx-auto max-w-6xl px-5 pt-5">
        <a
          href="/deals"
          className="group flex items-center justify-between gap-3 rounded-none border border-[var(--rust)]/40 bg-[var(--rust)]/[0.06] px-4 py-3 transition hover:border-[var(--rust)]"
        >
          <span className="text-[13px] leading-snug text-[var(--ink)] sm:text-sm">
            <span className="u-mono mr-1.5 font-bold text-[var(--rust)]">
              🔻 SALE
            </span>
            지금 <b>세일 중이거나 가격이 내려간</b> RRL만 모아봤어요
          </span>
          <span className="u-mono shrink-0 text-[11px] uppercase tracking-wide text-[var(--rust)] group-hover:underline">
            보러가기 →
          </span>
        </a>
      </div>

      <Explorer
        products={products}
        lastUpdated={lastUpdated}
        fxUsd={fxUsd}
        fxEur={fxEur}
        fxChf={fxChf}
      />

      <SiteFooter />
    </main>
  );
}
