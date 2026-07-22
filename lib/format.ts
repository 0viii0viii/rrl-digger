export function krw(n: number | null | undefined): string {
  if (n == null) return "—";
  return "₩" + Math.round(n).toLocaleString("ko-KR");
}

export function native(n: number | null | undefined, cur: string): string {
  if (n == null) return "—";
  const sym = cur === "EUR" ? "€" : cur === "USD" ? "$" : "";
  return sym + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

// Normalize a product title into a fuzzy match key so the same RRL item
// carried by two stores can be lined up for price comparison.
export function matchKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/rrl|double\s*rl|ralph\s*lauren|& ?co\.?/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\b(the|a|an|slim|fit|mens|men|womens|women)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const STORE_META: Record<string, { label: string; color: string }> = {
  cultizm: { label: "Cultizm", color: "#7a5c3e" },
  stag: { label: "Stag Provisions", color: "#3e5a7a" },
};

// Fraction of the listed price a non-EU (Korea) buyer actually pays the shop,
// after export VAT removal. EU shops list VAT-inclusive; US shops are pre-tax.
export const EXPORT_FACTOR: Record<string, number> = {
  cultizm: 1 / 1.19,
  stag: 1,
};

// Unified categories across the two shops' different taxonomies
// (Cultizm: "Jeans", "Denim Shirts"… / Stag: "Pants - Denim", "Tops - L/S Woven - Plaid"…)
export const CATEGORIES = [
  "아우터",
  "셔츠",
  "스웻·니트",
  "티셔츠",
  "데님",
  "팬츠",
  "슈즈",
  "모자",
  "가방",
  "벨트",
  "지갑",
  "반다나·스카프",
  "주얼리·소품",
  "기타",
] as const;

// In-stock sizes for a product (excludes Shopify's "Default Title" no-option variant).
export function availableSizes(
  variants: { title: string | null; available: boolean }[] | null,
): string[] {
  if (!variants) return [];
  return variants
    .filter((v) => v.available && v.title && v.title !== "Default Title")
    .map((v) => v.title as string);
}

// Loose size match: query token-prefixes any token of an available size.
// e.g. "32" → "33/32", "32/32"; "M" → "MEDIUM"; "MEDIUM" → "MEDIUM".
export function sizeMatches(sizes: string[], query: string): boolean {
  const q = query.trim().toUpperCase();
  if (!q) return true;
  return sizes.some((s) =>
    s
      .toUpperCase()
      .split(/[^A-Z0-9]+/)
      .filter(Boolean)
      .some((tok) => tok.startsWith(q)),
  );
}

export function categorize(productType: string | null): string {
  const t = (productType ?? "").toLowerCase();
  if (!t) return "기타";
  if (t === "jeans" || t.includes("pants - denim")) return "데님";
  if (t.startsWith("pants") || t === "shorts") return "팬츠";
  if (t.includes("shirt jacket")) return "아우터";
  if (t === "shirts" || t.includes("denim shirt") || t.includes("woven"))
    return "셔츠";
  if (
    t.includes("sweatshirt") ||
    t.includes("fleece") ||
    t.includes("sweater") ||
    t === "knitwear" ||
    t.includes("hoodie")
  )
    return "스웻·니트";
  if (t.includes("tee") || t === "longsleeves" || t.includes("knit"))
    return "티셔츠";
  if (
    t.includes("jacket") ||
    t.includes("coat") ||
    t.includes("outerwear") ||
    t.includes("vest") ||
    t.includes("suiting")
  )
    return "아우터";
  if (t.includes("boot") || t.startsWith("shoes") || t.includes("sneaker"))
    return "슈즈";
  if (t.includes("hat") || t.includes("cap")) return "모자";
  if (t.includes("bag") || t.includes("luggage")) return "가방";
  if (t.includes("belt")) return "벨트";
  if (t.includes("wallet")) return "지갑";
  if (t.includes("bandana") || t.includes("scarv") || t.includes("scarf"))
    return "반다나·스카프";
  if (
    t.includes("jewelry") ||
    t.includes("necklace") ||
    t.includes("pin") ||
    t.includes("watch band") ||
    t.includes("cuff") ||
    t.includes("key chain") ||
    t.includes("tie") ||
    t.includes("eyewear") ||
    t.includes("patch") ||
    t.startsWith("accessories")
  )
    return "주얼리·소품";
  return "기타";
}
