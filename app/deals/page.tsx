import type { Metadata } from "next";
import { getLatestFx } from "@/lib/fx";
import { supabase } from "@/lib/supabase";
import {
  krw,
  native,
  imgAt,
  STORE_META,
  EXPORT_FACTOR,
  categorize,
} from "@/lib/format";
import { estimateLanded } from "@/lib/customs";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";

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
    .map((p) => {
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
        p,
        cur,
        refKrw,
        pct,
        isSale: saleKrw > 0,
        isDrop: dropKrw > 0,
        landed: estimateLanded(cur, p.source, fxUsd, fxEur, fxChf),
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null)
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
        <p className="u-mono mt-3 text-[13px] text-[var(--ink)]">
          <b>{deals.length}</b>
          <span className="text-[var(--muted)]"> 건</span>
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
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
            {deals.map(({ p, cur, refKrw, pct, isSale, isDrop, landed }) => {
              const store = STORE_META[p.source];
              const factor = EXPORT_FACTOR[p.source] ?? 1;
              const exportNative =
                p.price_export ?? (p.price != null ? p.price * factor : null);
              const href = p.handle
                ? `/p/${p.source}/${p.handle}`
                : p.product_url;
              return (
                <a
                  key={p.id}
                  href={href}
                  suppressHydrationWarning
                  {...(!p.handle && {
                    target: "_blank",
                    rel: "sponsored nofollow noopener noreferrer",
                  })}
                  className="group flex flex-col overflow-hidden rounded-none border border-[var(--line)] bg-[var(--card)] transition duration-200 hover:-translate-y-1 hover:border-[var(--line-strong)] hover:shadow-[0_12px_30px_-12px_rgba(40,30,15,0.4)]"
                >
                  <div className="relative aspect-square overflow-hidden bg-[var(--paper-2)]">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imgAt(p.image_url, 400)}
                        srcSet={`${imgAt(p.image_url, 300)} 300w, ${imgAt(p.image_url, 500)} 500w`}
                        sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
                        alt={p.title}
                        width={400}
                        height={400}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="u-mono flex h-full items-center justify-center text-[10px] uppercase text-[var(--muted)]">
                        no image
                      </div>
                    )}
                    <span
                      className="u-mono absolute left-2 top-2 rounded-none px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
                      style={{ background: store.color }}
                    >
                      {store.label}
                    </span>
                    <span className="u-mono absolute right-2 top-2 rounded-none bg-[var(--rust)] px-1.5 py-0.5 text-[11px] font-black text-white">
                      ▼{pct}%
                    </span>
                    <span className="u-mono absolute bottom-2 left-2 rounded-none bg-[var(--ink)]/85 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#f1e8d6]">
                      {isDrop ? "가격 하락" : "세일"}
                      {isSale && isDrop ? " · 세일" : ""}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-3">
                    <p className="u-mono mb-1 text-[9px] uppercase tracking-[0.15em] text-[var(--muted)]">
                      {categorize(p.product_type)}
                    </p>
                    <p className="u-display line-clamp-2 text-[15px] font-medium leading-tight text-[var(--ink)]">
                      {p.title.replace(/^RRL\s*/i, "")}
                    </p>

                    <div className="mt-auto pt-2.5">
                      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                        <span className="u-mono text-lg font-bold leading-none text-[var(--rust)]">
                          {krw(cur)}
                        </span>
                        <span className="u-mono text-[11px] leading-none text-[var(--muted)] line-through">
                          {krw(refKrw)}
                        </span>
                      </div>
                      <div className="u-mono mt-0.5 text-[10px] text-[var(--muted)]">
                        {native(exportNative, p.currency)} {p.currency}
                      </div>

                      {landed && (
                        <div className="mt-2 border border-[var(--line-strong)] bg-[var(--paper-2)]/70">
                          <div className="flex items-center justify-between px-2 py-1.5">
                            <span className="u-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--ink)]/70">
                              도착가
                            </span>
                            <span className="u-mono text-[15px] font-bold text-[var(--indigo)]">
                              {krw(landed.total)}
                            </span>
                          </div>
                          <div className="u-mono border-t border-dashed border-[var(--line-strong)] px-2 py-1 text-[10px] text-[#6f6248]">
                            {landed.taxFree ? (
                              <span className="font-semibold text-emerald-700">
                                면세
                              </span>
                            ) : (
                              <>관세·부가세 {krw(landed.tax)}</>
                            )}
                            {" · 배송 "}
                            {krw(landed.shipping)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
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
