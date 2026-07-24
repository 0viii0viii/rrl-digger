import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 1000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rows: { source: string; handle: string; updated_at: string }[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("digg_products")
      .select("source, handle, updated_at")
      .eq("vendor", "RRL")
      .not("handle", "is", null)
      .range(from, from + PAGE_SIZE - 1);
    if (error || !data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
  }

  const products: MetadataRoute.Sitemap = rows.map((p) => ({
    url: `${SITE}/p/${p.source}/${p.handle}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    "/about",
    "/shops",
    "/guide/customs",
    "/contact",
  ].map((path) => ({
    url: `${SITE}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    {
      url: `${SITE}/`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...staticPages,
    ...products,
  ];
}
