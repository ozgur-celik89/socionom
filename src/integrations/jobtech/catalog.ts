import { unstable_cache } from "next/cache";
import type { JobSearchFilters } from "@/domain/jobs/types";
import { MAX_FETCH_LIMIT, MAX_OFFSET, buildSearchUrl, fetchJobtech, normalizeQuery } from "./client";
import { JobtechAdDeduplicator } from "./deduplication";
import { matchesApprovedJobSelection, isRenderableJobtechAd } from "./selection";
import type { JobtechAd, JobtechSearchResponse } from "./types";

/**
 * Katalogen behöver bara de fält som avgör om en annons får visas och som
 * används för dubblettmatchning. Annonstexten utelämnas medvetet: den står för
 * merparten av svarets storlek och kostar mest CPU att parsa.
 */
const CATALOG_RESULT_FIELDS = [
  "total{value}",
  "hits{id,headline,webpage_url,application_deadline,application_details{url},employer{name,workplace},workplace_address{municipality,region,postcode},occupation{concept_id},occupation_group{concept_id},publication_date,removed}",
].join(",");

const CATALOG_REVALIDATE_SECONDS = 600;
const MAX_CATALOG_RECORDS = MAX_OFFSET + MAX_FETCH_LIMIT;
const SCAN_BATCH_SIZE = 5;

export type CatalogEntry = {
  id: string;
  /** Annonsens plats i JobSearch osorterade träfflista. */
  offset: number;
};

export type JobCatalog = {
  entries: CatalogEntry[];
  /** True när JobSearch har fler träffar än vi kan nå via offset-taket. */
  truncated: boolean;
};

async function fetchCatalogPage(baseUrl: URL, offset: number, limit: number) {
  const url = new URL(baseUrl);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  const response = await fetchJobtech<JobtechSearchResponse>(
    url,
    CATALOG_REVALIDATE_SECONDS,
    CATALOG_RESULT_FIELDS,
  );

  return {
    hits: response.hits ?? [],
    total: Math.max(response.total?.value ?? 0, 0),
  };
}

function collect(deduplicator: JobtechAdDeduplicator, entries: CatalogEntry[], hits: JobtechAd[], offset: number) {
  for (const [index, ad] of hits.entries()) {
    const id = ad.id?.trim();
    if (!id || !matchesApprovedJobSelection(ad) || !isRenderableJobtechAd(ad)) continue;

    const outcome = deduplicator.add(ad);
    // Katalogen speglar avdubblarens lista post för post, så att posten alltid
    // pekar på den annons som faktiskt kommer att visas.
    if (outcome.created) entries.push({ id, offset: offset + index });
    else if (outcome.replaced) entries[outcome.index] = { id, offset: offset + index };
  }
}

/**
 * Skannar hela träfflistan en gång och sparar de annonser som faktiskt går att
 * visa. Filtrering och dubblettborttagning måste ske före pagineringen – annars
 * blir varje sida olika lång beroende på hur många träffar som råkade falla
 * bort i just det intervallet.
 */
async function scanCatalog(filters: JobSearchFilters): Promise<JobCatalog> {
  const baseUrl = buildSearchUrl(filters);
  const deduplicator = new JobtechAdDeduplicator();
  const entries: CatalogEntry[] = [];
  const firstPage = await fetchCatalogPage(baseUrl, 0, MAX_FETCH_LIMIT);

  collect(deduplicator, entries, firstPage.hits, 0);

  const reachable = Math.min(firstPage.total, MAX_CATALOG_RECORDS);
  const offsets: number[] = [];
  for (let offset = MAX_FETCH_LIMIT; offset < reachable; offset += MAX_FETCH_LIMIT) {
    offsets.push(offset);
  }

  // JobSearch svarar långsamt på breda sökningar. Batcharna håller nere både
  // svarstiden och antalet samtidiga anrop mot API:t.
  for (let start = 0; start < offsets.length; start += SCAN_BATCH_SIZE) {
    const batch = offsets.slice(start, start + SCAN_BATCH_SIZE);
    const pages = await Promise.all(
      batch.map((offset) => fetchCatalogPage(baseUrl, offset, Math.min(MAX_FETCH_LIMIT, reachable - offset))),
    );

    for (const [index, page] of pages.entries()) collect(deduplicator, entries, page.hits, batch[index]);
  }

  return { entries, truncated: firstPage.total > MAX_CATALOG_RECORDS };
}

const getCachedCatalog = unstable_cache(
  async (serializedFilters: string) => scanCatalog(JSON.parse(serializedFilters) as JobSearchFilters),
  ["jobtech-catalog"],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["jobtech-catalog"] },
);

/**
 * Katalogen delas mellan alla sidor med samma filter, så bara den första
 * begäran under ett revalidate-fönster betalar för skanningen.
 */
export function getJobCatalog(filters: JobSearchFilters): Promise<JobCatalog> {
  // Fälten listas i fast ordning så att samma filter alltid ger samma
  // cache-nyckel, oavsett i vilken ordning anroparen satte dem.
  return getCachedCatalog(JSON.stringify({
    query: normalizeQuery(filters.query),
    occupationGroupIds: filters.occupationGroupIds,
    occupationNameIds: filters.occupationNameIds,
    regionId: filters.regionId,
    worktimeExtentId: filters.worktimeExtentId,
    remote: filters.remote,
    sort: filters.sort,
  }));
}
