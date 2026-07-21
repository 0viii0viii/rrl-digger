import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Read-only public client (RLS allows SELECT only). Writes happen via scripts/sync.mjs.
export const supabase = createClient(url, anon, {
  auth: { persistSession: false },
});

export type Variant = {
  title: string | null;
  price: string | null;
  available: boolean;
  sku: string | null;
};

export type Product = {
  id: number;
  source: "cultizm" | "stag";
  source_product_id: string;
  handle: string | null;
  title: string;
  vendor: string | null;
  product_type: string | null;
  product_url: string;
  image_url: string | null;
  currency: "EUR" | "USD";
  price: number | null;
  compare_at_price: number | null;
  price_export: number | null;
  price_krw: number | null;
  grams: number | null;
  available: boolean;
  variants: Variant[] | null;
  tags: string[] | null;
  updated_at: string;
};
