import { supabase, type Product } from "@/lib/supabase";
import Explorer from "./Explorer";

export const revalidate = 600; // re-fetch from Supabase every 10 min

export default async function Home() {
  const { data, error } = await supabase
    .from("digg_products")
    .select("*")
    .eq("vendor", "RRL")
    .order("price_krw", { ascending: true });

  const products = (data ?? []) as Product[];

  const lastUpdated =
    products.length > 0
      ? products.reduce(
          (max, p) => (p.updated_at > max ? p.updated_at : max),
          products[0].updated_at,
        )
      : null;

  return (
    <main className="min-h-screen">
      <header className="border-b border-stone-300/70 bg-stone-900 text-stone-100">
        <div className="mx-auto max-w-6xl px-5 py-8">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-black tracking-tight">DIGGING</h1>
            <span className="text-xs uppercase tracking-[0.2em] text-amber-400/90">
              RRL price radar
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-300">
            Double RL(RRL) 상품을{" "}
            <b className="text-stone-100">Cultizm</b>(🇩🇪 EUR) ·{" "}
            <b className="text-stone-100">Stag Provisions</b>(🇺🇸 USD) 두
            편집샵에서 끌어와 원화로 환산 비교합니다. 같은 제품을 양쪽이
            취급하면 더 싼 쪽을 표시해요.
          </p>
        </div>
      </header>

      {error ? (
        <div className="mx-auto max-w-6xl px-5 py-16 text-center text-red-700">
          데이터를 불러오지 못했습니다: {error.message}
        </div>
      ) : (
        <Explorer products={products} lastUpdated={lastUpdated} />
      )}

      <footer className="border-t border-stone-300/70 py-8 text-center text-xs text-stone-500">
        가격·재고는 각 편집샵 데이터 기준이며 실제와 다를 수 있습니다 · 구매 전
        원 사이트에서 확인하세요
      </footer>
    </main>
  );
}
