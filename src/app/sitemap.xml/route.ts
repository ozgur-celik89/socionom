import { siteConfig } from "@/config/site";
import { escapeXml, xmlResponse } from "@/lib/xml";

export function GET() {
  const sitemaps = ["sitemap-pages.xml", "sitemap-jobs.xml"];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map((path) => `  <sitemap><loc>${escapeXml(`${siteConfig.url}/${path}`)}</loc></sitemap>`).join("\n")}
</sitemapindex>`;

  return xmlResponse(xml);
}
