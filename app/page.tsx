import { supabase, type Product } from "@/lib/supabase";
import Explorer from "./Explorer";

export const revalidate = 600; // re-fetch from Supabase every 10 min

function timeAgoKST(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

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
      <header className="bg-[var(--indigo-deep)] text-[#efe6d2]">
        <div className="mx-auto max-w-6xl px-5 pb-7 pt-9">
          <div className="flex items-center gap-3.5">
            <svg
              viewBox="0 0 100 100"
              className="h-14 w-14 shrink-0"
              aria-hidden="true"
            >
              <path
                d="M28.6 68 A28 28 0 1 1 71.4 68"
                fill="none"
                stroke="#efe6d2"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M50,33 L52.94,41.95 L62.4,42 L54.76,47.55 L57.6,56.5 L50,51 L42.4,56.5 L45.24,47.55 L37.6,42 L47.06,41.95 Z"
                fill="#cf9f4a"
              />
            </svg>
            <div>
              <h1 className="u-display text-3xl font-black leading-none tracking-tight">
                Lee&apos;s Ranch
              </h1>
              <span className="u-mono mt-1 block text-[10px] uppercase tracking-[0.32em] text-[#cf9f4a]">
                Americana · RRL price radar
              </span>
            </div>
          </div>
          <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-[#cdbf9f]">
            전 세계 편집샵의 <b className="text-[#efe6d2]">RRL(Double RL)</b>을
            원화로 비교하고, <b className="text-[#efe6d2]">관세·부가세·배송</b>까지
            얹은 <b className="text-[#efe6d2]">예상 도착가</b>를 알려드려요.
          </p>
        </div>
        {/* FX ticker */}
        <div className="border-t border-[#cf9f4a]/20 bg-black/15">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-1 px-5 py-2 u-mono text-[11px] tracking-wide text-[#cdbf9f]">
            <span className="text-[#cf9f4a]">TODAY&apos;S RATE</span>
            <span>
              EUR <b className="text-[#efe6d2]">₩{Math.round(fxEur).toLocaleString()}</b>
            </span>
            <span>
              USD <b className="text-[#efe6d2]">₩{Math.round(fxUsd).toLocaleString()}</b>
            </span>
            {lastUpdated && (
              <span className="ml-auto text-[#a99b78]">
                동기화 {timeAgoKST(lastUpdated)}
              </span>
            )}
          </div>
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

      <footer className="mx-auto max-w-6xl space-y-1 border-t border-[var(--line)] px-5 py-8 text-center text-[11px] leading-relaxed text-[var(--muted)]">
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
        <p className="pt-1 text-[var(--ink)]/70">
          <b>제휴 공지:</b> Lee&apos;s Ranch는 파트너 편집샵 링크를 통해 발생한
          구매에 대해 소정의 수수료를 받을 수 있습니다. 가격·표시에는 영향을
          주지 않습니다.
        </p>
        <p className="text-stone-400">
          Lee&apos;s Ranch는 Ralph Lauren · RRL(Double RL)과 제휴·후원·보증
          관계가 없는 독립 가격비교 서비스입니다. 모든 상표와 상품 이미지의
          권리는 각 소유자에게 있습니다.
        </p>
      </footer>
    </main>
  );
}
