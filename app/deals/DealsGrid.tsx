"use client";

import { useMemo, useState } from "react";
import type { Landed } from "@/lib/customs";
import { krw, native, imgAt, STORE_META, categorize, CATEGORIES } from "@/lib/format";

export type DealItem = {
  id: number;
  source: string;
  handle: string | null;
  title: string;
  productType: string | null;
  productUrl: string;
  imageUrl: string | null;
  currency: string;
  exportNative: number | null;
  cur: number;
  refKrw: number;
  pct: number;
  isSale: boolean;
  isDrop: boolean;
  landed: Landed;
};

export default function DealsGrid({ items }: { items: DealItem[] }) {
  const [category, setCategory] = useState("all");

  // Only offer categories that actually have deals right now.
  const cats = useMemo(() => {
    const present = new Set(items.map((i) => categorize(i.productType)));
    return ["all", ...CATEGORIES.filter((c) => present.has(c))];
  }, [items]);

  const shown = useMemo(
    () =>
      category === "all"
        ? items
        : items.filter((i) => categorize(i.productType) === category),
    [items, category],
  );

  return (
    <>
      {/* Category rail */}
      <div className="no-scrollbar mt-5 flex gap-1.5 overflow-x-auto pb-1">
        {cats.map((c) => {
          const on = category === c;
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`u-mono shrink-0 whitespace-nowrap rounded-none border px-3 py-1.5 text-[11px] uppercase tracking-wider transition ${
                on
                  ? "border-[var(--indigo)] bg-[var(--indigo)] text-[#f1e8d6]"
                  : "border-[var(--line-strong)] bg-[var(--card)] text-[var(--muted)] hover:border-[var(--indigo)] hover:text-[var(--ink)]"
              }`}
            >
              {c === "all" ? "전체" : c}
            </button>
          );
        })}
      </div>

      <p className="u-mono mt-3 text-[13px] text-[var(--ink)]">
        <b>{shown.length}</b>
        <span className="text-[var(--muted)]"> 건</span>
      </p>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((d) => {
          const store = STORE_META[d.source];
          const href = d.handle ? `/p/${d.source}/${d.handle}` : d.productUrl;
          return (
            <a
              key={d.id}
              href={href}
              suppressHydrationWarning
              {...(!d.handle && {
                target: "_blank",
                rel: "sponsored nofollow noopener noreferrer",
              })}
              className="group flex flex-col overflow-hidden rounded-none border border-[var(--line)] bg-[var(--card)] transition duration-200 hover:-translate-y-1 hover:border-[var(--line-strong)] hover:shadow-[0_12px_30px_-12px_rgba(40,30,15,0.4)]"
            >
              <div className="relative aspect-square overflow-hidden bg-[var(--paper-2)]">
                {d.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgAt(d.imageUrl, 400)}
                    srcSet={`${imgAt(d.imageUrl, 300)} 300w, ${imgAt(d.imageUrl, 500)} 500w`}
                    sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
                    alt={d.title}
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
                  ▼{d.pct}%
                </span>
                <span className="u-mono absolute bottom-2 left-2 rounded-none bg-[var(--ink)]/85 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#f1e8d6]">
                  {d.isDrop ? "가격 하락" : "세일"}
                  {d.isSale && d.isDrop ? " · 세일" : ""}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-3">
                <p className="u-mono mb-1 text-[9px] uppercase tracking-[0.15em] text-[var(--muted)]">
                  {categorize(d.productType)}
                </p>
                <p className="u-display line-clamp-2 text-[15px] font-medium leading-tight text-[var(--ink)]">
                  {d.title.replace(/^RRL\s*/i, "")}
                </p>

                <div className="mt-auto pt-2.5">
                  <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                    <span className="u-mono text-lg font-bold leading-none text-[var(--rust)]">
                      {krw(d.cur)}
                    </span>
                    <span className="u-mono text-[11px] leading-none text-[var(--muted)] line-through">
                      {krw(d.refKrw)}
                    </span>
                  </div>
                  <div className="u-mono mt-0.5 text-[10px] text-[var(--muted)]">
                    {native(d.exportNative, d.currency)} {d.currency}
                  </div>

                  <div className="mt-2 border border-[var(--line-strong)] bg-[var(--paper-2)]/70">
                    <div className="flex items-center justify-between px-2 py-1.5">
                      <span className="u-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--ink)]/70">
                        도착가
                      </span>
                      <span className="u-mono text-[15px] font-bold text-[var(--indigo)]">
                        {krw(d.landed.total)}
                      </span>
                    </div>
                    <div className="u-mono border-t border-dashed border-[var(--line-strong)] px-2 py-1 text-[10px] text-[#6f6248]">
                      {d.landed.taxFree ? (
                        <span className="font-semibold text-emerald-700">면세</span>
                      ) : (
                        <>관세·부가세 {krw(d.landed.tax)}</>
                      )}
                      {" · 배송 "}
                      {krw(d.landed.shipping)}
                    </div>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </>
  );
}
