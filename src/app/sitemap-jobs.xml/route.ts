import { siteConfig } from "@/config/site";
import type { SitemapJob } from "@/domain/jobs/types";
import { getJobsForSitemap } from "@/integrations/jobtech/search";
import { escapeXml, xmlResponse } from "@/lib/xml";

export async function GET() {
  let jobs: SitemapJob[];

  try {
    jobs = await getJobsForSitemap();
  } catch {
    const unavailableXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;

    return xmlResponse(unavailableXml, {
      status: 503,
      cacheControl: "no-store",
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${jobs.map((job) => {
    const location = escapeXml(`${siteConfig.url}/lediga-jobb/${job.id}/${job.slug}`);
    const lastModified = job.sourceUpdatedAt ? `<lastmod>${escapeXml(job.sourceUpdatedAt)}</lastmod>` : "";
    return `  <url><loc>${location}</loc>${lastModified}<changefreq>daily</changefreq></url>`;
  }).join("\n")}
</urlset>`;

  return xmlResponse(xml, {
    cacheControl: "public, s-maxage=3600, stale-while-revalidate=86400",
  });
}
