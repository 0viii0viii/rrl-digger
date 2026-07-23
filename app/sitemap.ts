import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await supabase
    .from("digg_products")
    .select("source, handle, updated_at")
    .eq("vendor", "RRL")
    .not("handle", "is", null);

  const products: MetadataRoute.Sitemap = (data ?? []).map((p) => ({
    url: `${SITE}/p/${p.source}/${p.handle}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [
    {
      url: `${SITE}/`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...products,
  ];
}
