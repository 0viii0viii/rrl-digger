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

// Cultizm ships to Korea "from €25" via DHL/UPS, weight-based (tiers not
// published) — approximate by weight. €25 is the floor for the lightest parcels.
function cultizmShipEUR(grams: number): number {
  const kg = (grams || 0) / 1000;
  if (kg <= 0.5) return 25;
  if (kg <= 1) return 30;
  if (kg <= 2) return 40;
  if (kg <= 3) return 50;
  if (kg <= 5) return 65;
  return 80;
}

// Shipping estimate (KRW). Stag = flat $50 DHL. Cultizm = weight-based DHL/UPS.
export function estShippingKRW(
  source: string,
  usdKrw: number,
  eurKrw: number,
  grams = 0,
): number {
  return source === "stag"
    ? Math.round(50 * usdKrw) // Stag flat $50 DHL Express
    : Math.round(cultizmShipEUR(grams) * eurKrw);
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
  grams = 0,
): Landed {
  const thresholdUSD = deMinimisUSD(source);
  const thresholdKRW = thresholdUSD * usdKrw;
  const shipping = estShippingKRW(source, usdKrw, eurKrw, grams);

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
