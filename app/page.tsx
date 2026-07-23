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
  const [products, { fxUsd, fxEur }] = await Promise.all([
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
      <SiteHeader fxUsd={fxUsd} fxEur={fxEur} lastUpdated={lastUpdated} />

      <Explorer
        products={products}
        lastUpdated={lastUpdated}
        fxUsd={fxUsd}
        fxEur={fxEur}
      />

      <SiteFooter />
    </main>
  );
}
