"use client";

import { useEffect, useMemo, useState } from "react";
import { type Product } from "@/lib/supabase";
import {
  krw,
  native,
  matchKey,
  STORE_META,
  EXPORT_FACTOR,
  CATEGORIES,
  categorize,
  genderOf,
  availableSizes,
  sizeMatches,
} from "@/lib/format";
import { estimateLanded } from "@/lib/customs";

type SortKey = "price_asc" | "price_desc" | "title";

// Apply a Cultizm coupon (%) to a KRW price. Only affects Cultizm items.
function couponedKrw(
  krwVal: number | null,
  src: string,
  pct: number,
): number | null {
  if (krwVal == null) return null;
  const f = src === "cultizm" && pct > 0 ? 1 - pct / 100 : 1;
  return Math.round(krwVal * f);
}

export default function Explorer({
  products,
  lastUpdated,
  fxUsd,
  fxEur,
  fxChf,
}: {
  products: Product[];
  lastUpdated: string | null;
  fxUsd: number;
  fxEur: number;
  fxChf: number;
}) {
  const [q, setQ] = useState("");
  const [source, setSource] = useState<string>("all");
  // Which stores actually appear in the current data — drives the filter list
  // so adding a shop needs no UI change here.
  const activeSources = useMemo(() => {
    const seen = new Set<string>(products.map((p) => p.source));
    return Object.keys(STORE_META).filter((s) => seen.has(s));
  }, [products]);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [onlyComparable, setOnlyComparable] = useState(false);
  const [sort, setSort] = useState<SortKey>("price_asc");
  const [coupon, setCoupon] = useState(0);
  const couponPct = Math.min(90, Math.max(0, coupon));
  const [category, setCategory] = useState("all");
  const [gender, setGender] = useState<"all" | "men" | "women">("all");
  const hasWomen = useMemo(
    () => products.some((p) => genderOf(p.tags, p.title) === "women"),
    [products],
  );

  // ?category= deep link (from product pages) — read client-side only, so the
  // homepage stays statically cached (no useSearchParams/Suspense, no dynamic
  // rendering) and the full grid is still present in the server HTML.
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("category");
    if (c && (CATEGORIES as readonly string[]).includes(c)) setCategory(c);
  }, []);
  const [sizeQuery, setSizeQuery] = useState("");
  const [showAdv, setShowAdv] = useState(false);

  // Group by fuzzy match key to detect items carried by BOTH stores.
  const { comparableKeys, cheaperByKey } = useMemo(() => {
    const groups = new Map<string, Product[]>();
    for (const p of products) {
      const k = matchKey(p.title);
      if (!k) continue;
      (groups.get(k) ?? groups.set(k, []).get(k)!).push(p);
    }
    const comparableKeys = new Set<string>();
    const cheaperByKey = new Map<string, number>();
    for (const [k, list] of groups) {
      const sources = new Set(list.map((p) => p.source));
      if (sources.size >= 2) {
        comparableKeys.add(k);
        const withPrice = list.filter((p) => p.price_krw != null);
        if (withPrice.length) {
          const cheapest = withPrice.reduce((a, b) =>
            (couponedKrw(a.price_krw, a.source, couponPct) ?? Infinity) <=
            (couponedKrw(b.price_krw, b.source, couponPct) ?? Infinity)
              ? a
              : b,
          );
          cheaperByKey.set(k, cheapest.id);
        }
      }
    }
    return { comparableKeys, cheaperByKey };
  }, [products, couponPct]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = products.filter((p) => {
      if (inStockOnly && !p.available) return false;
      if (source !== "all" && p.source !== source) return false;
      if (gender !== "all" && genderOf(p.tags, p.title) !== gender) return false;
      if (category !== "all" && categorize(p.product_type) !== category)
        return false;
      if (sizeQuery.trim() && !sizeMatches(availableSizes(p.variants), sizeQuery))
        return false;
      if (onlyComparable && !comparableKeys.has(matchKey(p.title))) return false;
      if (needle && !p.title.toLowerCase().includes(needle)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      const av = couponedKrw(a.price_krw, a.source, couponPct) ?? Infinity;
      const bv = couponedKrw(b.price_krw, b.source, couponPct) ?? Infinity;
      return sort === "price_asc" ? av - bv : bv - av;
    });
    return list;
  }, [
    products,
    q,
    source,
    gender,
    category,
    sizeQuery,
    inStockOnly,
    onlyComparable,
    sort,
    comparableKeys,
    couponPct,
  ]);

  const stats = useMemo(
    () => ({
      total: products.length,
      inStock: products.filter((p) => p.available).length,
      comparable: comparableKeys.size,
    }),
    [products, comparableKeys],
  );

  // Active-filter chips
  const chips: { label: string; onClear: () => void }[] = [];
  if (q.trim()) chips.push({ label: `검색 "${q}"`, onClear: () => setQ("") });
  if (gender !== "all")
    chips.push({
      label: gender === "women" ? "여성" : "남성",
      onClear: () => setGender("all"),
    });
  if (category !== "all")
    chips.push({ label: category, onClear: () => setCategory("all") });
  if (source !== "all")
    chips.push({
      label: STORE_META[source]?.label ?? source,
      onClear: () => setSource("all"),
    });
  if (sizeQuery.trim())
    chips.push({ label: `사이즈 ${sizeQuery}`, onClear: () => setSizeQuery("") });
  if (couponPct > 0)
    chips.push({ label: `쿠폰 −${couponPct}%`, onClear: () => setCoupon(0) });
  if (onlyComparable)
    chips.push({ label: "여러 샵 취급", onClear: () => setOnlyComparable(false) });
  if (!inStockOnly)
    chips.push({ label: "품절 포함", onClear: () => setInStockOnly(true) });

  const advActive =
    gender !== "all" || !!sizeQuery.trim() || couponPct > 0 || onlyComparable;

  const reset = () => {
    setQ("");
    setCategory("all");
    setSource("all");
    setGender("all");
    setSizeQuery("");
    setCoupon(0);
    setOnlyComparable(false);
    setInStockOnly(true);
  };

  const cats = ["all", ...CATEGORIES];

  return (
    <div className="mx-auto max-w-6xl px-5 pb-16">
      {/* Sticky nav: category rail + controls */}
      <div className="sticky top-0 z-20 -mx-5 border-b border-[var(--line-strong)] bg-[var(--paper)]/94 px-5 backdrop-blur">
        {/* Category rail */}
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto py-3">
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

        {/* Control row */}
        <div className="flex flex-wrap items-center gap-2 pb-3">
          <label className="flex min-w-[200px] flex-1 items-center gap-2 rounded-none border border-[var(--line-strong)] bg-[var(--card)] px-3 py-2 focus-within:border-[var(--indigo)]">
            <svg
              className="h-4 w-4 shrink-0 text-[var(--muted)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="제품명 검색 — jean, chore jacket, henley…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
            />
          </label>
          <Select
            value={source}
            onChange={setSource}
            options={[
              ["all", "전체 편집샵"],
              ...activeSources.map(
                (s) => [s, STORE_META[s].label] as [string, string],
              ),
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
          <button
            onClick={() => setShowAdv((v) => !v)}
            className={`relative rounded-none border px-3 py-2 text-sm font-medium transition ${
              showAdv || advActive
                ? "border-[var(--indigo)] bg-[var(--indigo)] text-[#f1e8d6]"
                : "border-[var(--line-strong)] bg-[var(--card)] text-[var(--ink)] hover:border-[var(--indigo)]"
            }`}
          >
            필터 {showAdv ? "▴" : "▾"}
            {advActive && !showAdv && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-none bg-[var(--rust)]" />
            )}
          </button>
        </div>

        {/* Advanced filters (collapsible) */}
        {showAdv && (
          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--line)] py-3">
            {hasWomen && (
              <div className="flex rounded-none border border-[var(--line-strong)] bg-[var(--card)] text-sm">
                {(
                  [
                    ["all", "성별 전체"],
                    ["men", "남성"],
                    ["women", "여성"],
                  ] as [typeof gender, string][]
                ).map(([g, label]) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`px-2.5 py-2 transition ${
                      gender === g
                        ? "bg-[var(--indigo)] text-[#f1e8d6]"
                        : "text-[var(--ink)] hover:bg-[var(--paper-2)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            <Toggle
              active={onlyComparable}
              onClick={() => setOnlyComparable((v) => !v)}
              label="여러 샵 취급"
            />
            <FieldInput
              icon="📏"
              label="내 사이즈"
              active={!!sizeQuery.trim()}
              value={sizeQuery}
              onChange={setSizeQuery}
              placeholder="32/32"
              width="w-16"
            />
            <div
              className={`flex items-center gap-1 rounded-none border px-2.5 py-2 text-sm ${
                couponPct > 0
                  ? "border-[var(--rust)] bg-[var(--rust)]/10 text-[var(--rust)]"
                  : "border-[var(--line-strong)] bg-[var(--card)] text-[var(--muted)]"
              }`}
              title="Cultizm 상품에 쿠폰 할인율(%)을 적용합니다"
            >
              <span className="whitespace-nowrap text-xs">🎟 Cultizm 쿠폰</span>
              <input
                type="number"
                min={0}
                max={90}
                value={coupon || ""}
                onChange={(e) => setCoupon(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-9 bg-transparent text-right outline-none"
              />
              <span className="text-xs">%</span>
            </div>
          </div>
        )}
      </div>

      {/* Result count + active chips */}
      <div className="flex flex-wrap items-center gap-2 py-3 text-[13px]">
        <span className="u-mono text-[var(--ink)]">
          <b>{filtered.length.toLocaleString()}</b>
          <span className="text-[var(--muted)]"> / {stats.inStock.toLocaleString()} 재고</span>
        </span>
        {chips.map((c) => (
          <button
            key={c.label}
            onClick={c.onClear}
            className="group inline-flex items-center gap-1 rounded-none border border-[var(--line-strong)] bg-[var(--card)] px-2.5 py-1 text-[11px] text-[var(--ink)] hover:border-[var(--rust)]"
          >
            {c.label}
            <span className="text-[var(--muted)] group-hover:text-[var(--rust)]">✕</span>
          </button>
        ))}
        {chips.length > 0 && (
          <button
            onClick={reset}
            className="u-mono text-[11px] uppercase tracking-wide text-[var(--rust)] underline underline-offset-2"
          >
            초기화
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-24 text-center">
          <p className="u-display text-xl text-[var(--ink)]">아무것도 없네요</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            필터를 풀거나 검색어를 바꿔보세요.
          </p>
          <button
            onClick={reset}
            className="u-mono mt-4 rounded-none border border-[var(--line-strong)] px-4 py-2 text-xs uppercase tracking-wide hover:border-[var(--indigo)]"
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p, i) => {
            const key = matchKey(p.title);
            return (
              <Card
                key={p.id}
                p={p}
                index={i}
                comparable={comparableKeys.has(key)}
                isCheapest={cheaperByKey.get(key) === p.id}
                fxUsd={fxUsd}
                fxEur={fxEur}
                fxChf={fxChf}
                couponPct={couponPct}
                sizeQuery={sizeQuery}
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
  index,
  comparable,
  isCheapest,
  fxUsd,
  fxEur,
  fxChf,
  couponPct,
  sizeQuery,
}: {
  p: Product;
  index: number;
  comparable: boolean;
  isCheapest: boolean;
  fxUsd: number;
  fxEur: number;
  fxChf: number;
  couponPct: number;
  sizeQuery: string;
}) {
  const store = STORE_META[p.source];
  const couponApplies = p.source === "cultizm" && couponPct > 0;
  const couponFactor = couponApplies ? 1 - couponPct / 100 : 1;
  const effKrw =
    p.price_krw != null ? Math.round(p.price_krw * couponFactor) : null;
  const landed =
    effKrw != null
      ? estimateLanded(effKrw, p.source, fxUsd, fxEur, fxChf)
      : null;
  const onSale =
    p.compare_at_price != null &&
    p.price != null &&
    p.compare_at_price > p.price;
  const factor = EXPORT_FACTOR[p.source] ?? 1;
  const exportNative =
    p.price_export ?? (p.price != null ? p.price * factor : null);
  const compareExport =
    p.compare_at_price != null ? p.compare_at_price * factor : null;
  const effExportNative =
    exportNative != null ? exportNative * couponFactor : null;
  const vatFree = p.source === "cultizm";
  const sizes = availableSizes(p.variants);
  const highlight = couponApplies || (comparable && isCheapest);
  // Internal detail page when we have a handle (SEO + comparison table);
  // falls back to the external boutique link for the rare row without one.
  const href = p.handle ? `/p/${p.source}/${p.handle}` : p.product_url;

  return (
    <a
      href={href}
      suppressHydrationWarning
      {...(!p.handle && { target: "_blank", rel: "noopener noreferrer" })}
      className="rise group flex flex-col overflow-hidden rounded-none border border-[var(--line)] bg-[var(--card)] transition duration-200 hover:-translate-y-1 hover:border-[var(--line-strong)] hover:shadow-[0_12px_30px_-12px_rgba(40,30,15,0.4)]"
      style={{ animationDelay: `${Math.min(index, 22) * 28}ms` }}
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--paper-2)]">
        {p.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image_url}
            alt={p.title}
            loading="lazy"
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
        {!p.available && (
          <span className="u-mono absolute right-2 top-2 rounded-none bg-[var(--ink)]/85 px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#f1e8d6]">
            SOLD OUT
          </span>
        )}
        {comparable && (
          <span className="u-mono absolute bottom-2 left-2 rounded-none bg-[var(--gold)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--ink)]">
            여러 샵{isCheapest ? " · 최저가" : ""}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="u-mono mb-1 text-[9px] uppercase tracking-[0.15em] text-[var(--muted)]">
          {categorize(p.product_type)}
        </p>
        <p className="u-display line-clamp-2 text-[15px] font-medium leading-tight text-[var(--ink)]">
          {p.title.replace(/^RRL\s*/i, "")}
        </p>

        {sizes.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {sizes.slice(0, 6).map((s) => {
              const hit = sizeQuery.trim() && sizeMatches([s], sizeQuery);
              return (
                <span
                  key={s}
                  className={`u-mono rounded-none px-1 py-px text-[9px] leading-tight ${
                    hit
                      ? "bg-[var(--indigo)] font-bold text-[#f1e8d6]"
                      : "border border-[var(--line)] text-[var(--muted)]"
                  }`}
                >
                  {s}
                </span>
              );
            })}
            {sizes.length > 6 && (
              <span className="u-mono text-[9px] text-[var(--muted)]">
                +{sizes.length - 6}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-2.5">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`u-mono text-lg font-bold leading-none ${
                highlight ? "text-[var(--rust)]" : "text-[var(--ink)]"
              }`}
            >
              {krw(effKrw)}
            </span>
            {couponApplies && (
              <span className="u-mono text-[10px] font-bold text-[var(--rust)]">
                −{couponPct}%
              </span>
            )}
            {onSale && !couponApplies && (
              <span className="u-mono text-[10px] font-bold text-[var(--rust)]">
                SALE
              </span>
            )}
          </div>
          <div className="u-mono mt-0.5 text-[10px] text-[var(--muted)]">
            {native(effExportNative, p.currency)} {p.currency}
            {couponApplies ? (
              <span className="ml-1 line-through opacity-70">
                {native(exportNative, p.currency)}
              </span>
            ) : (
              onSale && (
                <span className="ml-1 line-through opacity-70">
                  {native(compareExport, p.currency)}
                </span>
              )
            )}
            {vatFree && <span className="ml-1 text-[var(--indigo)]">· VAT 제외</span>}
          </div>

          {/* Landed-cost stamp — the differentiator */}
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
                  <span className="font-semibold text-emerald-700">면세</span>
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
      className="rounded-none border border-[var(--line-strong)] bg-[var(--card)] px-2.5 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--indigo)]"
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
      className={`rounded-none border px-3 py-2 text-sm font-medium transition ${
        active
          ? "border-[var(--indigo)] bg-[var(--indigo)] text-[#f1e8d6]"
          : "border-[var(--line-strong)] bg-[var(--card)] text-[var(--ink)] hover:border-[var(--indigo)]"
      }`}
    >
      {label}
    </button>
  );
}

function FieldInput({
  icon,
  label,
  active,
  value,
  onChange,
  placeholder,
  width,
}: {
  icon: string;
  label: string;
  active: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  width: string;
}) {
  return (
    <div
      className={`flex items-center gap-1 rounded-none border px-2.5 py-2 text-sm ${
        active
          ? "border-[var(--indigo)] bg-[var(--indigo)] text-[#f1e8d6]"
          : "border-[var(--line-strong)] bg-[var(--card)] text-[var(--muted)]"
      }`}
    >
      <span className="whitespace-nowrap text-xs">
        {icon} {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${width} bg-transparent outline-none placeholder:text-current placeholder:opacity-50`}
      />
    </div>
  );
}
