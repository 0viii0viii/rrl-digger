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
