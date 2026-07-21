// Rough estimate of Korean personal-import duty + VAT (해외직구 자가사용).
// This is an ESTIMATE, not an official quote — customs uses its own weekly FX
// and the exact duty rate depends on the item's HS code.
//
// Rules modeled:
// - 면세(de minimis): goods price ≤ $150 (US-purchased ≤ $200 under KORUS FTA).
//   Checked on goods price only (shipping excluded), per common practice.
// - Over threshold: duty on (goods + shipping), then 10% VAT on (goods+shipping+duty).
// - Duty rate defaults to 13% (apparel). Other categories differ.

export const DUTY_RATE = 0.13; // 의류 기준
export const VAT_RATE = 0.1;

export function deMinimisUSD(source: string): number {
  return source === "stag" ? 200 : 150; // Stag ships from US → $200
}

// Flat per-order shipping to Korea. Weight tiers aren't published and the feed's
// weights are unreliable, so these are fixed values verified from checkout.
// NOTE: charged per ORDER — buying multiple items amortizes it (real per-item
// cost is lower), but each card is estimated as a single-item purchase.
const STAG_SHIP_USD = 50; // Stag flat DHL Express
const CULTIZM_SHIP_EUR = 36; // Cultizm to Korea, ~₩60k observed (policy "from €25")

export function estShippingKRW(
  source: string,
  usdKrw: number,
  eurKrw: number,
): number {
  return source === "stag"
    ? Math.round(STAG_SHIP_USD * usdKrw)
    : Math.round(CULTIZM_SHIP_EUR * eurKrw);
}

export type Landed = {
  taxFree: boolean;
  goods: number;
  shipping: number;
  duty: number;
  vat: number;
  tax: number; // duty + vat
  total: number; // goods + shipping + tax
  thresholdUSD: number;
};

export function estimateLanded(
  goodsKRW: number,
  source: string,
  usdKrw: number,
  eurKrw: number,
): Landed {
  const thresholdUSD = deMinimisUSD(source);
  const thresholdKRW = thresholdUSD * usdKrw;
  const shipping = estShippingKRW(source, usdKrw, eurKrw);

  if (goodsKRW <= thresholdKRW) {
    return {
      taxFree: true,
      goods: goodsKRW,
      shipping,
      duty: 0,
      vat: 0,
      tax: 0,
      total: goodsKRW + shipping,
      thresholdUSD,
    };
  }

  const base = goodsKRW + shipping; // 과세가격 (CIF-ish)
  const duty = Math.round(base * DUTY_RATE);
  const vat = Math.round((base + duty) * VAT_RATE);
  const tax = duty + vat;
  return {
    taxFree: false,
    goods: goodsKRW,
    shipping,
    duty,
    vat,
    tax,
    total: base + tax,
    thresholdUSD,
  };
}
