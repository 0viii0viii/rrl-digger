import { supabase, type Product } from "@/lib/supabase";

const PAGE_SIZE = 1000;

// Only the columns the client (Explorer/Card) actually reads. Every field here
// is serialized into the page's RSC payload for ~650 rows, so dropping unused
// columns (grams, source_product_id, last_seen_at) shrinks what mobile downloads.
const COLUMNS =
  "id, source, handle, title, vendor, product_type, product_url, image_url, currency, price, compare_at_price, price_export, price_krw, available, variants, tags, updated_at";

/**
 * In-stock RRL listings for the homepage grid.
 *
 * Only `available` rows are fetched: sold-out items (~2/3 of the catalog) are
 * hidden by default and would otherwise be serialized into the client payload
 * for nothing. They still have their own detail pages + sitemap entries, so
 * SEO/indexing is unaffected — this only trims what the homepage ships.
 *
 * Supabase/PostgREST caps a single request at ~1000 rows — page through.
 */
export async function getAllRRLProducts(): Promise<Product[]> {
  const all: Product[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("digg_products")
      .select(COLUMNS)
      .eq("vendor", "RRL")
      .eq("available", true)
      // Secondary sort by id: price_krw has many ties, and without a stable
      // tiebreaker the .range() page boundaries can repeat/skip rows.
      .order("price_krw", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error || !data || data.length === 0) break;
    all.push(...(data as unknown as Product[]));
    if (data.length < PAGE_SIZE) break;
  }
  // The client only needs each variant's size label + availability — drop
  // price/sku so they don't bloat the payload for every variant of every product.
  for (const p of all) {
    if (Array.isArray(p.variants)) {
      p.variants = p.variants.map((v) => ({
        title: v.title,
        available: v.available,
        price: null,
        sku: null,
      }));
    }
  }
  return all;
}
