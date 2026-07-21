// Shared RRL ingestion logic — used by both the CLI (scripts/sync.mjs)
// and the Vercel Cron endpoint (app/api/sync/route.ts).
import { createClient } from "@supabase/supabase-js";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

const STORES = {
  cultizm: { base: "https://www.cultizm.com", currency: "EUR" },
  stag: { base: "https://www.stagprovisions.com", currency: "USD" },
};
const VENDOR = new Set([
  "rrl",
  "double rl",
  "double rl ralph lauren",
  "rrl & co",
]);

async function getJSON(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

async function fetchAll(base, { delayMs = 200, maxPages = 60 } = {}) {
  const out = [];
  for (let page = 1; page <= maxPages; page++) {
    const d = await getJSON(`${base}/products.json?limit=250&page=${page}`);
    const prods = d.products ?? [];
    if (!prods.length) break;
    out.push(...prods);
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
  }
  return out;
}

async function getFx() {
  const fx = { USD: 1380, EUR: 1490 }; // fallback
  try {
    const d = await getJSON("https://open.er-api.com/v6/latest/USD");
    const rates = d.rates ?? {};
    if (rates.KRW && rates.EUR) {
      fx.USD = +rates.KRW.toFixed(2);
      fx.EUR = +(rates.KRW / rates.EUR).toFixed(2);
    }
  } catch {
    // keep fallback
  }
  return fx;
}

function normalize(p, source, base, currency, fx, nowIso) {
  const variants = p.variants ?? [];
  const prices = variants.map((v) => +v.price).filter((n) => n > 0);
  const price = prices.length ? Math.min(...prices) : null;
  const cmp = variants.map((v) => +v.compare_at_price).filter((n) => n > 0);
  const compareAt = cmp.length ? Math.max(...cmp) : null;
  const available = variants.some((v) => v.available);
  const image = p.images?.[0]?.src ?? null;
  return {
    source,
    source_product_id: String(p.id),
    handle: p.handle ?? null,
    title: p.title,
    vendor: p.vendor ?? "RRL",
    product_type: p.product_type ?? null,
    product_url: `${base}/products/${p.handle}`,
    image_url: image,
    currency,
    price,
    compare_at_price: compareAt,
    price_krw: price != null ? Math.round(price * fx[currency]) : null,
    available,
    variants: variants.map((v) => ({
      title: v.title ?? null,
      price: v.price ?? null,
      available: !!v.available,
      sku: v.sku ?? null,
    })),
    tags: Array.isArray(p.tags)
      ? p.tags
      : typeof p.tags === "string"
        ? p.tags.split(",").map((t) => t.trim())
        : [],
    updated_at: nowIso,
    last_seen_at: nowIso,
  };
}

async function upsertChunked(sb, rows) {
  let done = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error } = await sb
      .from("digg_products")
      .upsert(chunk, { onConflict: "source,source_product_id" });
    if (error) throw new Error(error.message);
    done += chunk.length;
  }
  return done;
}

/**
 * Fetch RRL products from all stores and sync into Supabase.
 * Marks products no longer present in a store's feed as unavailable
 * (so sold-out / removed items don't linger).
 */
export async function runIngest({ supabaseUrl, serviceKey, log = () => {} }) {
  const sb = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
  const fx = await getFx();
  log(`FX native->KRW: USD ${fx.USD}, EUR ${fx.EUR}`);
  const summary = [];

  for (const [source, cfg] of Object.entries(STORES)) {
    const runStart = new Date().toISOString();
    const all = await fetchAll(cfg.base);
    const rrl = all.filter((p) =>
      VENDOR.has((p.vendor ?? "").trim().toLowerCase()),
    );
    const now = new Date().toISOString();
    const rows = rrl.map((p) =>
      normalize(p, source, cfg.base, cfg.currency, fx, now),
    );
    const upserted = await upsertChunked(sb, rows);

    // Anything for this source not touched in this run = gone from the feed.
    const { count: removed } = await sb
      .from("digg_products")
      .update({ available: false, updated_at: now }, { count: "exact" })
      .eq("source", source)
      .lt("last_seen_at", runStart);

    await sb.from("digg_sync_runs").insert({
      source,
      fetched: all.length,
      upserted,
      fx_usd_krw: fx.USD,
      fx_eur_krw: fx.EUR,
      note: `RRL ${rrl.length}/${all.length}, marked_gone ${removed ?? 0}`,
    });

    log(
      `[${source}] fetched ${all.length}, RRL ${rrl.length}, upserted ${upserted}, gone ${removed ?? 0}`,
    );
    summary.push({
      source,
      fetched: all.length,
      rrl: rrl.length,
      upserted,
      markedGone: removed ?? 0,
    });
  }

  return { fx, summary };
}
