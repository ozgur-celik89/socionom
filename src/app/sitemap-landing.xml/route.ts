import { occupationCategories } from "@/config/jobs";
import { regions } from "@/config/regions";
import { siteConfig } from "@/config/site";
import { isIndexableLanding } from "@/lib/landing";
import { escapeXml, xmlResponse } from "@/lib/xml";

// Varje kombination kräver en katalogskanning. Batcharna håller nere antalet
// samtidiga anrop mot JobSearch, precis som katalogens egen skanning gör.
const BATCH_SIZE = 8;

export async function GET() {
  const combinations = occupationCategories.flatMap((occupation) =>
    regions.map((region) => ({ occupation, region })),
  );
  const paths: string[] = [];

  try {
    for (let start = 0; start < combinations.length; start += BATCH_SIZE) {
      const batch = combinations.slice(start, start + BATCH_SIZE);
      const verdicts = await Promise.all(batch.map((combination) => isIndexableLanding(combination)));

      for (const [index, indexable] of verdicts.entries()) {
        if (!indexable) continue;
        const { occupation, region } = batch[index];
        paths.push(`/lediga-jobb/yrke/${occupation.slug}/${region.slug}`);
      }
    }
  } catch {
    // Ett tomt urlset skulle läsas som att sidorna har tagits bort. 503 ber
    // sökmotorn återkomma i stället.
    const unavailableXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;

    return xmlResponse(unavailableXml, { status: 503, cacheControl: "no-store" });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${escapeXml(`${siteConfig.url}${path}`)}</loc><changefreq>daily</changefreq></url>`).join("\n")}
</urlset>`;

  return xmlResponse(xml, {
    cacheControl: "public, s-maxage=3600, stale-while-revalidate=86400",
  });
}
