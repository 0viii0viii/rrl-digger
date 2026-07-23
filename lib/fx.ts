import { supabase } from "@/lib/supabase";

// Latest FX snapshot from the most recent sync run, used for the landed-cost estimate.
export async function getLatestFx(): Promise<{ fxUsd: number; fxEur: number }> {
  const { data } = await supabase
    .from("digg_sync_runs")
    .select("fx_usd_krw, fx_eur_krw")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return {
    fxUsd: Number(data?.fx_usd_krw ?? 1380),
    fxEur: Number(data?.fx_eur_krw ?? 1490),
  };
}
