"use client";

import { useMemo, useState } from "react";
import { type Product } from "@/lib/supabase";
import { krw, native, matchKey, STORE_META, EXPORT_FACTOR } from "@/lib/format";
import { estimateLanded } from "@/lib/customs";

type SortKey = "price_asc" | "price_desc" | "title";

export default function Explorer({
  products,
  lastUpdated,
  fxUsd,
  fxEur,
}: {
  products: Product[];
  lastUpdated: string | null;
  fxUsd: number;
  fxEur: number;
}) {
  const [q, setQ] = useState("");
  const [source, setSource] = useState<"all" | "cultizm" | "stag">("all");
  const [inStockOnly, setInStockOnly] = useState(true);
  const [onlyComparable, setOnlyComparable] = useState(false);
  const [sort, setSort] = useState<SortKey>("price_asc");

  // Group by fuzzy match key to detect items carried by BOTH stores.
  const { comparableKeys, cheaperByKey } = useMemo(() => {
    const groups = new Map<string, Product[]>();
    for (const p of products) {
      const k = matchKey(p.title);
      if (!k) continue;
      (groups.get(k) ?? groups.set(k, []).get(k)!).push(p);
    }
    const comparableKeys = new Set<string>();
    const cheaperByKey = new Map<string, number>(); // key -> cheapest product id
    for (const [k, list] of groups) {
      const sources = new Set(list.map((p) => p.source));
      if (sources.size >= 2) {
        comparableKeys.add(k);
        const withPrice = list.filter((p) => p.price_krw != null);
        if (withPrice.length) {
          const cheapest = withPrice.reduce((a, b) =>
            (a.price_krw ?? Infinity) <= (b.price_krw ?? Infinity) ? a : b,
          );
          cheaperByKey.set(k, cheapest.id);
        }
      }
    }
    return { comparableKeys, cheaperByKey };
  }, [products]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = products.filter((p) => {
      if (inStockOnly && !p.available) return false;
      if (source !== "all" && p.source !== source) return false;
      if (onlyComparable && !comparableKeys.has(matchKey(p.title))) return false;
      if (needle && !p.title.toLowerCase().includes(needle)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      const av = a.price_krw ?? Infinity;
      const bv = b.price_krw ?? Infinity;
      return sort === "price_asc" ? av - bv : bv - av;
    });
    return list;
  }, [products, q, source, inStockOnly, onlyComparable, sort, comparableKeys]);

  const stats = useMemo(() => {
    const inStock = products.filter((p) => p.available);
    return {
      total: products.length,
      inStock: inStock.length,
      cultizm: products.filter((p) => p.source === "cultizm").length,
      stag: products.filter((p) => p.source === "stag").length,
      comparable: comparableKeys.size,
    };
  }, [products, comparableKeys]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-6">
      {/* Stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="전체 RRL" value={stats.total} />
        <Stat label="재고 있음" value={stats.inStock} accent />
        <Stat label="양쪽 취급(비교가능)" value={stats.comparable} />
        <Stat
          label="업데이트"
          value={lastUpdated ? timeAgo(lastUpdated) : "—"}
          small
        />
      </div>

      {/* Controls */}
      <div className="sticky top-0 z-10 -mx-5 mb-5 border-y border-stone-300/70 bg-[var(--paper)]/95 px-5 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="제품명 검색 (예: chore jacket, henley, chino)"
            className="min-w-[220px] flex-1 rounded-md border border-stone-400/60 bg-white px-3 py-2 text-sm outline-none focus:border-stone-700"
          />
          <Select
            value={source}
            onChange={(v) => setSource(v as typeof source)}
            options={[
              ["all", "전체 편집샵"],
              ["cultizm", "Cultizm"],
              ["stag", "Stag Provisions"],
            ]}
          />
          <Select
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
            options={[
              ["price_asc", "가격 낮은순"],
              ["price_desc", "가격 높은순"],
              ["title", "이름순"],
            ]}
          />
          <Toggle
            active={inStockOnly}
            onClick={() => setInStockOnly((v) => !v)}
            label="재고만"
          />
          <Toggle
            active={onlyComparable}
            onClick={() => setOnlyComparable((v) => !v)}
            label="비교가능만"
          />
        </div>
        <p className="mt-2 text-xs text-stone-500">
          {filtered.length.toLocaleString()}개 표시 중
        </p>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-stone-500">
          조건에 맞는 상품이 없어요. 필터를 풀어보세요.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => {
            const key = matchKey(p.title);
            const comparable = comparableKeys.has(key);
            const isCheapest = cheaperByKey.get(key) === p.id;
            return (
              <Card
                key={p.id}
                p={p}
                comparable={comparable}
                isCheapest={isCheapest}
                fxUsd={fxUsd}
                fxEur={fxEur}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function Card({
  p,
  comparable,
  isCheapest,
  fxUsd,
  fxEur,
}: {
  p: Product;
  comparable: boolean;
  isCheapest: boolean;
  fxUsd: number;
  fxEur: number;
}) {
  const store = STORE_META[p.source];
  const landed =
    p.price_krw != null
      ? estimateLanded(p.price_krw, p.source, fxUsd, fxEur)
      : null;
  const onSale =
    p.compare_at_price != null && p.price != null && p.compare_at_price > p.price;
  const factor = EXPORT_FACTOR[p.source] ?? 1;
  // Native price the buyer actually pays the shop (VAT removed for EU).
  const exportNative =
    p.price_export ?? (p.price != null ? p.price * factor : null);
  const compareExport =
    p.compare_at_price != null ? p.compare_at_price * factor : null;
  const vatFree = p.source === "cultizm";
  return (
    <a
      href={p.product_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-lg border border-stone-300/70 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        {p.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image_url}
            alt={p.title}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-stone-400">
            no image
          </div>
        )}
        <span
          className="absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
          style={{ background: store.color }}
        >
          {store.label}
        </span>
        {!p.available && (
          <span className="absolute right-2 top-2 rounded bg-stone-800/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            품절
          </span>
        )}
        {comparable && (
          <span className="absolute bottom-2 left-2 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-stone-900">
            양쪽 취급{isCheapest ? " · 최저가" : ""}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="line-clamp-2 text-[13px] font-medium leading-snug text-stone-800">
          {p.title.replace(/^RRL\s*/i, "")}
        </p>
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-base font-black ${
                comparable && isCheapest ? "text-amber-700" : "text-stone-900"
              }`}
            >
              {krw(p.price_krw)}
            </span>
            {onSale && (
              <span className="text-[11px] font-semibold text-red-600">
                SALE
              </span>
            )}
          </div>
          <div className="text-[11px] text-stone-500">
            {native(exportNative, p.currency)} {p.currency}
            {onSale && (
              <span className="ml-1 line-through">
                {native(compareExport, p.currency)}
              </span>
            )}
            {vatFree && (
              <span className="ml-1 font-medium text-emerald-700">
                VAT 제외
              </span>
            )}
          </div>
          {landed && (
            <div className="mt-1 text-[10px] leading-tight">
              {landed.taxFree ? (
                <span className="font-semibold text-emerald-700">
                  ✓ 면세 예상 (${landed.thresholdUSD} 이하)
                </span>
              ) : (
                <span className="text-stone-500">
                  +관세·부가세 ~{krw(landed.tax)}
                  <span className="text-stone-400">
                    {" · "}도착가 ~{krw(landed.total)}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}

function Stat({
  label,
  value,
  accent,
  small,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div className="rounded-lg border border-stone-300/70 bg-white px-4 py-3">
      <div
        className={`font-black ${small ? "text-sm" : "text-2xl"} ${
          accent ? "text-amber-700" : "text-stone-900"
        }`}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="text-[11px] uppercase tracking-wide text-stone-500">
        {label}
      </div>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-stone-400/60 bg-white px-2 py-2 text-sm outline-none focus:border-stone-700"
    >
      {options.map(([v, label]) => (
        <option key={v} value={v}>
          {label}
        </option>
      ))}
    </select>
  );
}

function Toggle({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
        active
          ? "border-stone-900 bg-stone-900 text-white"
          : "border-stone-400/60 bg-white text-stone-700 hover:border-stone-600"
      }`}
    >
      {label}
    </button>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}
