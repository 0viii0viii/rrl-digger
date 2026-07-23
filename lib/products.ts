import { supabase, type Product } from "@/lib/supabase";

const PAGE_SIZE = 1000;

/**
 * Supabase/PostgREST caps a single request at ~1000 rows — page through to
 * get the full catalog (currently ~1,400+ RRL listings across both shops).
 */
export async function getAllRRLProducts(): Promise<Product[]> {
  const all: Product[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("digg_products")
      .select("*")
      .eq("vendor", "RRL")
      .order("price_krw", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error || !data || data.length === 0) break;
    all.push(...(data as Product[]));
    if (data.length < PAGE_SIZE) break;
  }
  return all;
}
