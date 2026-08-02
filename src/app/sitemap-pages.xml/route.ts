import { occupationCategories } from "@/config/jobs";
import { priorityRegions } from "@/config/regions";
import { siteConfig } from "@/config/site";
import { escapeXml, xmlResponse } from "@/lib/xml";

export function GET() {
  const paths = [
    "",
    "/jobb",
    "/jobb/distans",
    "/om",
    "/sa-valjer-vi-jobb",
    "/annonsera",
    "/kontakt",
    "/integritet",
    "/kakor",
    ...occupationCategories.map((occupation) => `/jobb/yrke/${occupation.slug}`),
    ...priorityRegions.map((region) => `/jobb/ort/${region.slug}`),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${escapeXml(`${siteConfig.url}${path}`)}</loc></url>`).join("\n")}
</urlset>`;

  return xmlResponse(xml);
}
