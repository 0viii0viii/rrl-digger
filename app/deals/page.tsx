import type { Metadata } from "next";
import { getLatestFx } from "@/lib/fx";
import { supabase } from "@/lib/supabase";
import { EXPORT_FACTOR } from "@/lib/format";
import { estimateLanded } from "@/lib/customs";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import DealsGrid, { type DealItem } from "./DealsGrid";

export const revalidate = 1800; // refresh every 30 min

const MIN_PCT = 5; // ignore trivial markdowns
const RECENT_DAYS = 14; // "price dropped" counts only if changed recently
const MAX = 120;

export const metadata: Metadata = {
  title: "지금 세일·가격 하락 중인 RRL",
  description:
    "해외 편집샵에서 지금 세일 중이거나 최근 가격이 내려간 RRL(Double RL)만 모았어요. 원화 최저가와 관세 포함 예상 도착가를 한눈에 확인하세요.",
  alternates: { canonical: "/deals" },
};

type Row = {
  id: number;
  source: "cultizm" | "stag" | "deecee";
  handle: string | null;
  title: string;
  product_type: string | null;
  product_url: string;
  image_url: string | null;
  currency: "EUR" | "USD" | "CHF";
  price: number | null;
  compare_at_price: number | null;
  price_export: number | null;
  price_krw: number | null;
  prev_price: number | null;
  price_changed_at: string | null;
};

export default async function DealsPage() {
  const [{ fxUsd, fxEur, fxChf }, { data }] = await Promise.all([
    getLatestFx(),
    supabase
      .from("digg_products")
      .select(
        "id, source, handle, title, product_type, product_url, image_url, currency, price, compare_at_price, price_export, price_krw, prev_price, price_changed_at",
      )
      .eq("vendor", "RRL")
      .eq("available", true)
      .or("compare_at_price.not.is.null,prev_price.not.is.null")
      .limit(1000),
  ]);

  const fx: Record<string, number> = { EUR: fxEur, USD: fxUsd, CHF: fxChf };
  const cutoff = Date.now() - RECENT_DAYS * 86_400_000;

  const deals = ((data ?? []) as Row[])
    .map((p): DealItem | null => {
      const cur = p.price_krw;
      if (cur == null) return null;
      const factor = EXPORT_FACTOR[p.source] ?? 1;

      // Sale: shop's compare-at price is above the current price.
      const onSale =
        p.compare_at_price != null && p.price != null && p.compare_at_price > p.price;
      const saleKrw = onSale
        ? Math.round(p.compare_at_price! * factor * (fx[p.currency] ?? 0))
        : 0;

      // Drop: the shop's native price fell recently. Convert the previous
      // native price to KRW at today's rate for the strike-through reference.
      const recent =
        p.price_changed_at != null &&
        new Date(p.price_changed_at).getTime() >= cutoff;
      const dropped =
        recent &&
        p.prev_price != null &&
        p.price != null &&
        p.prev_price > p.price;
      const dropKrw = dropped
        ? Math.round(p.prev_price! * factor * (fx[p.currency] ?? 0))
        : 0;

      const refKrw = Math.max(saleKrw, dropKrw);
      if (refKrw <= cur) return null;
      const pct = Math.round((1 - cur / refKrw) * 100);
      if (pct < MIN_PCT) return null;

      return {
        id: p.id,
        source: p.source,
        handle: p.handle,
        title: p.title,
        productType: p.product_type,
        productUrl: p.product_url,
        imageUrl: p.image_url,
        currency: p.currency,
        exportNative:
          p.price_export ?? (p.price != null ? p.price * factor : null),
        cur,
        refKrw,
        pct,
        isSale: saleKrw > 0,
        isDrop: dropKrw > 0,
        landed: estimateLanded(cur, p.source, fxUsd, fxEur, fxChf),
      };
    })
    .filter((d): d is DealItem => d !== null)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, MAX);

  return (
    <main className="min-h-screen">
      <SiteHeader
        fxUsd={fxUsd}
        fxEur={fxEur}
        fxChf={fxChf}
        lastUpdated={null}
        compact
      />

      <div className="mx-auto max-w-6xl px-5 py-8">
        <h1 className="u-display text-[28px] font-medium leading-tight text-[var(--ink)] sm:text-3xl">
          지금 세일·가격 하락 중인 RRL
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">
          해외 편집샵에서 <b className="text-[var(--ink)]">세일 중</b>이거나 최근{" "}
          <b className="text-[var(--ink)]">가격이 내려간</b> RRL만 모았어요. 할인
          폭이 큰 순서로 보여드려요.
        </p>
        {deals.length === 0 ? (
          <div className="py-24 text-center">
            <p className="u-display text-xl text-[var(--ink)]">
              지금은 눈에 띄는 딜이 없어요
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              가격은 6시간마다 갱신돼요 — 조금 뒤에 다시 확인해보세요.
            </p>
            <a
              href="/"
              className="u-mono mt-4 inline-block border border-[var(--line-strong)] px-4 py-2 text-xs uppercase tracking-wide hover:border-[var(--indigo)]"
            >
              전체 상품 보기
            </a>
          </div>
        ) : (
          <DealsGrid items={deals} />
        )}

        <a
          href="/"
          className="u-mono mt-10 inline-block text-[11px] uppercase tracking-wide text-[var(--indigo)] underline underline-offset-2"
        >
          ← 전체 상품 보기
        </a>
      </div>

      <SiteFooter />
    </main>
  );
}
