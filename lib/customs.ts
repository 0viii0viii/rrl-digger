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

// Rough shipping assumption per shop (KRW). Labeled as an assumption in the UI.
export function estShippingKRW(
  source: string,
  usdKrw: number,
  eurKrw: number,
): number {
  return source === "stag"
    ? Math.round(50 * usdKrw) // Stag flat $50 DHL Express
    : Math.round(25 * eurKrw); // Cultizm rest-of-world (assumed ~€25)
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
