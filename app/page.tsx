import { getAllRRLProducts } from "@/lib/products";
import { getLatestFx } from "@/lib/fx";
import Explorer from "./Explorer";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

export const revalidate = 600; // re-fetch from Supabase every 10 min

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [products, { fxUsd, fxEur }, { category }] = await Promise.all([
    getAllRRLProducts(),
    getLatestFx(),
    searchParams,
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
        initialCategory={category}
      />

      <SiteFooter />
    </main>
  );
}
