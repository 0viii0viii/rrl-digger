import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabase, type Product } from "@/lib/supabase";
import { getLatestFx } from "@/lib/fx";
import { SITE } from "@/lib/site";
import {
  krw,
  native,
  matchKey,
  STORE_META,
  EXPORT_FACTOR,
  categorize,
  availableSizes,
} from "@/lib/format";
import { estimateLanded } from "@/lib/customs";
import SiteHeader from "../../../SiteHeader";
import SiteFooter from "../../../SiteFooter";

export const revalidate = 3600; // re-check this product hourly

type Params = { source: string; handle: string };

async function getProduct(source: string, handle: string) {
  const { data } = await supabase
    .from("digg_products")
    .select("*")
    .eq("source", source)
    .eq("handle", handle)
    .eq("vendor", "RRL")
    .maybeSingle();
  return data as Product | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { source, handle } = await params;
  const p = await getProduct(source, handle);
  if (!p) return { title: "상품을 찾을 수 없어요" };

  const name = p.title.replace(/^RRL\s*/i, "");
  const store = STORE_META[p.source]?.label ?? p.source;
  // layout.tsx's title.template appends " · Lee's Ranch" — don't duplicate it here.
  const title = `RRL ${name} 가격비교 · 직구 도착가 — ${store}`;
  const description = `${store}의 RRL ${name} — 원화 참고가 ${krw(
    p.price_krw,
  )}, 관세·부가세·배송 포함 예상 도착가까지 한눈에 비교하세요.`;
  const path = `/p/${p.source}/${p.handle}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: SITE + path,
      title,
      description,
      images: p.image_url ? [{ url: p.image_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: p.image_url ? [p.image_url] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { source, handle } = await params;
  const p = await getProduct(source, handle);
  if (!p) notFound();

  const { fxUsd, fxEur } = await getLatestFx();

  // Find the same item carried by the other shop, if any.
  const key = matchKey(p.title);
  let comparables: Product[] = [];
  if (key) {
    const { data } = await supabase
      .from("digg_products")
      .select("*")
      .eq("vendor", "RRL")
      .neq("id", p.id);
    comparables = ((data ?? []) as Product[]).filter(
      (o) => matchKey(o.title) === key,
    );
  }

  const name = p.title.replace(/^RRL\s*/i, "");
  const store = STORE_META[p.source];
  const factor = EXPORT_FACTOR[p.source] ?? 1;
  const exportNative =
    p.price_export ?? (p.price != null ? p.price * factor : null);
  const onSale =
    p.compare_at_price != null &&
    p.price != null &&
    p.compare_at_price > p.price;
  const compareExport =
    p.compare_at_price != null ? p.compare_at_price * factor : null;
  const landed =
    p.price_krw != null ? estimateLanded(p.price_krw, p.source, fxUsd, fxEur) : null;
  const sizes = availableSizes(p.variants);
  const vatFree = p.source === "cultizm";

  const allListings = [p, ...comparables].filter((x) => x.price_krw != null);
  const cheapestId = allListings.length
    ? allListings.reduce((a, b) => ((a.price_krw ?? 0) <= (b.price_krw ?? 0) ? a : b)).id
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Lee's Ranch", item: SITE + "/" },
          {
            "@type": "ListItem",
            position: 2,
            name: categorize(p.product_type),
            item: `${SITE}/?category=${encodeURIComponent(categorize(p.product_type))}`,
          },
          { "@type": "ListItem", position: 3, name },
        ],
      },
      {
        "@type": "Product",
        name: `RRL ${name}`,
        image: p.image_url ? [p.image_url] : undefined,
        brand: { "@type": "Brand", name: "RRL (Double RL)" },
        category: categorize(p.product_type),
        url: `${SITE}/p/${p.source}/${p.handle}`,
        offers: allListings.map((o) => ({
          "@type": "Offer",
          url: o.product_url,
          priceCurrency: "KRW",
          price: o.price_krw ?? undefined,
          availability: o.available
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          seller: { "@type": "Organization", name: STORE_META[o.source]?.label ?? o.source },
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen">
      <SiteHeader fxUsd={fxUsd} fxEur={fxEur} lastUpdated={p.updated_at} compact />

      <div className="mx-auto max-w-5xl px-5 py-6">
        <nav className="u-mono mb-4 flex flex-wrap items-center gap-1 text-[11px] uppercase tracking-wide text-[var(--muted)]">
          <a href="/" className="hover:text-[var(--indigo)]">
            전체
          </a>
          <span>/</span>
          <a
            href={`/?category=${encodeURIComponent(categorize(p.product_type))}`}
            className="hover:text-[var(--indigo)]"
          >
            {categorize(p.product_type)}
          </a>
        </nav>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden border border-[var(--line)] bg-[var(--paper-2)]">
            {p.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image_url}
                alt={p.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="u-mono flex h-full items-center justify-center text-[10px] uppercase text-[var(--muted)]">
                no image
              </div>
            )}
            <span
              className="u-mono absolute left-2 top-2 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
              style={{ background: store.color }}
            >
              {store.label}
            </span>
            {!p.available && (
              <span className="u-mono absolute right-2 top-2 bg-[var(--ink)]/85 px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#f1e8d6]">
                SOLD OUT
              </span>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="u-mono text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">
              {categorize(p.product_type)} · {store.label}
            </p>
            <h1 className="u-display mt-1 text-2xl font-medium leading-tight text-[var(--ink)]">
              RRL {name}
            </h1>

            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="u-mono text-3xl font-bold text-[var(--ink)]">
                  {krw(p.price_krw)}
                </span>
                {onSale && (
                  <span className="u-mono text-xs font-bold text-[var(--rust)]">SALE</span>
                )}
              </div>
              <div className="u-mono mt-1 text-[12px] text-[var(--muted)]">
                {native(exportNative, p.currency)} {p.currency}
                {onSale && (
                  <span className="ml-1 line-through opacity-70">
                    {native(compareExport, p.currency)}
                  </span>
                )}
                {vatFree && <span className="ml-1 text-[var(--indigo)]">· VAT 제외</span>}
              </div>
            </div>

            {sizes.length > 0 && (
              <div className="mt-4">
                <p className="u-mono mb-1.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                  재고 사이즈
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {sizes.map((s) => (
                    <span
                      key={s}
                      className="u-mono border border-[var(--line-strong)] px-2 py-1 text-[11px] text-[var(--ink)]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {landed && (
              <div className="mt-5 border border-[var(--line-strong)] bg-[var(--paper-2)]/70">
                <div className="flex items-center justify-between px-3 py-2.5">
                  <span className="u-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--ink)]/70">
                    🇰🇷 예상 도착가
                  </span>
                  <span className="u-mono text-xl font-bold text-[var(--indigo)]">
                    {krw(landed.total)}
                  </span>
                </div>
                <div className="u-mono border-t border-dashed border-[var(--line-strong)] px-3 py-2 text-[11px] text-[#6f6248]">
                  {landed.taxFree ? (
                    <span className="font-semibold text-emerald-700">
                      면세 (${landed.thresholdUSD} 이하)
                    </span>
                  ) : (
                    <>관세·부가세 {krw(landed.tax)}</>
                  )}
                  {" · 배송 "}
                  {krw(landed.shipping)}
                </div>
              </div>
            )}

            <a
              href={p.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="u-mono mt-5 flex items-center justify-center gap-2 border border-[var(--indigo)] bg-[var(--indigo)] px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-[#f1e8d6] transition hover:bg-[var(--indigo-deep)]"
            >
              {store.label}에서 구매하러 가기 ↗
            </a>
            <p className="u-mono mt-2 text-center text-[10px] text-[var(--muted)]">
              외부 사이트로 이동합니다 · 구매 시 수수료를 받을 수 있어요
            </p>
          </div>
        </div>

        {/* Comparable listings across shops */}
        {comparables.length > 0 && (
          <div className="mt-12">
            <h2 className="u-display text-lg font-medium text-[var(--ink)]">
              다른 편집샵 가격
            </h2>
            <div className="mt-3 divide-y divide-[var(--line)] border border-[var(--line)]">
              {allListings
                .sort((a, b) => (a.price_krw ?? 0) - (b.price_krw ?? 0))
                .map((o) => {
                  const isSelf = o.id === p.id;
                  const oStore = STORE_META[o.source];
                  return (
                    <a
                      key={o.id}
                      href={isSelf ? undefined : `/p/${o.source}/${o.handle}`}
                      className={`flex items-center justify-between gap-3 px-4 py-3 text-sm ${
                        isSelf
                          ? "bg-[var(--paper-2)]/60"
                          : "hover:bg-[var(--paper-2)]/40"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="u-mono px-1.5 py-0.5 text-[9px] font-bold uppercase text-white"
                          style={{ background: oStore.color }}
                        >
                          {oStore.label}
                        </span>
                        {isSelf && (
                          <span className="u-mono text-[10px] text-[var(--muted)]">
                            (지금 보는 상품)
                          </span>
                        )}
                        {!o.available && (
                          <span className="u-mono text-[10px] text-[var(--muted)]">품절</span>
                        )}
                      </span>
                      <span
                        className={`u-mono font-bold ${
                          o.id === cheapestId ? "text-[var(--rust)]" : "text-[var(--ink)]"
                        }`}
                      >
                        {krw(o.price_krw)}
                        {o.id === cheapestId && " · 최저가"}
                      </span>
                    </a>
                  );
                })}
            </div>
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
