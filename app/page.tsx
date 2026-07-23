import { Suspense } from "react";
import { supabase, type Product } from "@/lib/supabase";
import { getLatestFx } from "@/lib/fx";
import Explorer from "./Explorer";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

export const revalidate = 600; // re-fetch from Supabase every 10 min

export default async function Home() {
  const { data, error } = await supabase
    .from("digg_products")
    .select("*")
    .eq("vendor", "RRL")
    .order("price_krw", { ascending: true });

  const products = (data ?? []) as Product[];
  const { fxUsd, fxEur } = await getLatestFx();

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

      {error ? (
        <div className="mx-auto max-w-6xl px-5 py-16 text-center text-red-700">
          데이터를 불러오지 못했습니다: {error.message}
        </div>
      ) : (
        <Suspense fallback={null}>
          <Explorer
            products={products}
            lastUpdated={lastUpdated}
            fxUsd={fxUsd}
            fxEur={fxEur}
          />
        </Suspense>
      )}

      <SiteFooter />
    </main>
  );
}
