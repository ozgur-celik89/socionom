import { occupationCategories } from "@/config/jobs";
import { priorityRegions } from "@/config/regions";
import { siteConfig } from "@/config/site";
import { escapeXml, xmlResponse } from "@/lib/xml";

export function GET() {
  const paths = [
    "",
    "/lediga-jobb",
    "/lediga-jobb/distans",
    "/om",
    "/sa-valjer-vi-jobb",
    "/annonsera",
    "/kontakt",
    "/integritet",
    "/kakor",
    ...occupationCategories.map((occupation) => `/lediga-jobb/yrke/${occupation.slug}`),
    ...priorityRegions.map((region) => `/lediga-jobb/ort/${region.slug}`),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${escapeXml(`${siteConfig.url}${path}`)}</loc></url>`).join("\n")}
</urlset>`;

  return xmlResponse(xml);
}
