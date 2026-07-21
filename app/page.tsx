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

  // Latest FX (from the most recent sync) for the customs estimate.
  const { data: fxRow } = await supabase
    .from("digg_sync_runs")
    .select("fx_usd_krw, fx_eur_krw")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const fxUsd = Number(fxRow?.fx_usd_krw ?? 1380);
  const fxEur = Number(fxRow?.fx_eur_krw ?? 1490);

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
          <div className="flex items-center gap-3">
            <svg
              viewBox="0 0 100 100"
              className="h-12 w-12 shrink-0"
              aria-hidden="true"
            >
              <path
                d="M28.6 68 A28 28 0 1 1 71.4 68"
                fill="none"
                stroke="#f0e6d2"
                strokeWidth="13"
                strokeLinecap="round"
              />
              <path
                d="M50,33 L52.94,41.95 L62.4,42 L54.76,47.55 L57.6,56.5 L50,51 L42.4,56.5 L45.24,47.55 L37.6,42 L47.06,41.95 Z"
                fill="#cf9f4a"
              />
            </svg>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-wide">
                LEE&apos;S RANCH
              </h1>
              <span className="text-[11px] uppercase tracking-[0.2em] text-amber-400/90">
                Americana · RRL price radar
              </span>
            </div>
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
        <Explorer
          products={products}
          lastUpdated={lastUpdated}
          fxUsd={fxUsd}
          fxEur={fxEur}
        />
      )}

      <footer className="mx-auto max-w-6xl space-y-1 px-5 py-8 text-center text-[11px] leading-relaxed text-stone-500">
        <p>
          표시 가격은 <b>중간환율 기준 참고가</b>예요. 실제 결제는 카드사 환율·
          수수료, 각 샵 환전 마진으로 <b>조금 다를 수 있어요.</b>
        </p>
        <p>
          관세는 <b>자가사용 직구 추정치</b>입니다 — 의류 관세 13% + 부가세 10%,
          면세 한도 미국(Stag) $200 / 기타(Cultizm) $150. 배송비는 <b>주문당 정액
          추정</b>(Stag $50 · Cultizm €36) — 여러 개 함께 사면 나눠져서 실제 개당
          비용은 더 낮아져요. HS코드·실제 배송비에 따라 달라집니다.
        </p>
        <p>가격·재고는 각 편집샵 피드 기준 · 구매 전 원 사이트에서 확인하세요.</p>
      </footer>
    </main>
  );
}
