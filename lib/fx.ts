import { supabase } from "@/lib/supabase";

export type Fx = { fxUsd: number; fxEur: number; fxChf: number };

// Latest FX snapshot from the most recent sync run, used for the landed-cost estimate.
export async function getLatestFx(): Promise<Fx> {
  const { data } = await supabase
    .from("digg_sync_runs")
    .select("fx_usd_krw, fx_eur_krw, fx_chf_krw")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return {
    fxUsd: Number(data?.fx_usd_krw ?? 1380),
    fxEur: Number(data?.fx_eur_krw ?? 1490),
    fxChf: Number(data?.fx_chf_krw ?? 1550),
  };
}
