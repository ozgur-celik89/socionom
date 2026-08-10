import type { JobSearchFilters, JobSearchResult, JobSummary, SitemapJob } from "@/domain/jobs/types";
import { coreOccupationGroupIds, excludedOccupationNameIds } from "@/config/jobs";
import { mapJobtechAd, mapJobtechAdSummary, mapJobtechSitemapJob } from "./mapper";
import { deduplicateJobtechAds } from "./deduplication";
import { matchesApprovedJobSelection } from "./selection";
import { getJobCatalog, type CatalogEntry } from "./catalog";
import {
  JOBSEARCH_BASE_URL,
  MAX_FETCH_LIMIT,
  MAX_OFFSET,
  SWEDEN_CONCEPT_ID,
  buildSearchUrl,
  fetchJobtech,
} from "./client";
import type { JobtechAd, JobtechSearchResponse } from "./types";

const DEFAULT_PAGE_SIZE = 20;
const SEARCH_RESULT_FIELDS = [
  "hits{id,webpage_url,logo_url,headline,application_deadline,application_details{url},description{text},employment_type{label},duration{label},working_hours_type{label},scope_of_work{min,max},employer{name,workplace},occupation{concept_id},occupation_group{concept_id},workplace_address{municipality,municipality_concept_id,region,region_concept_id,country,country_code,city,postcode},publication_date,removed}",
].join(",");
const SITEMAP_RESULT_FIELDS = [
  "total{value}",
  "hits{id,headline,application_deadline,application_details{url},employer{name,workplace},workplace_address{municipality,region,postcode},publication_date,removed,timestamp,occupation{concept_id},occupation_group{concept_id}}",
].join(",");

// Katalogen är några minuter gammal när sidan hämtas. Nya annonser skjuter
// träffarna framåt i listan, så fönstret hämtas med marginal åt båda håll.
const WINDOW_PADDING_BEFORE = 4;
const WINDOW_PADDING_AFTER = 12;

export { JobSearchUnavailableError } from "./client";

async function fetchAdWindow(baseUrl: URL, offset: number, limit: number) {
  const url = new URL(baseUrl);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  const response = await fetchJobtech<JobtechSearchResponse>(url, 600, SEARCH_RESULT_FIELDS);
  return response.hits ?? [];
}

/**
 * Hämtar de råa annonser som täcker sidans katalogposter. Fönstret är nästan
 * alltid ett enda anrop – ett per sidvisning, precis som tidigare.
 */
async function fetchWindowForEntries(filters: JobSearchFilters, entries: CatalogEntry[]) {
  const first = Math.max(entries[0].offset - WINDOW_PADDING_BEFORE, 0);
  const last = Math.min(
    entries[entries.length - 1].offset + WINDOW_PADDING_AFTER,
    MAX_OFFSET + MAX_FETCH_LIMIT - 1,
  );
  const baseUrl = buildSearchUrl(filters);
  const requests: Promise<JobtechAd[]>[] = [];

  for (let offset = first; offset <= last; offset += MAX_FETCH_LIMIT) {
    const limit = Math.min(MAX_FETCH_LIMIT, last - offset + 1);
    if (offset > MAX_OFFSET) break;
    requests.push(fetchAdWindow(baseUrl, offset, limit));
  }

  const hits = (await Promise.all(requests)).flat();
  return new Map(hits.map((ad) => [ad.id?.trim() ?? "", ad]));
}

export async function searchJobs(filters: JobSearchFilters = {}): Promise<JobSearchResult> {
  const pageSize = Math.min(Math.max(filters.pageSize ?? DEFAULT_PAGE_SIZE, 1), 100);
  const catalog = await getJobCatalog(filters);
  const total = catalog.entries.length;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const page = Math.min(Math.max(filters.page ?? 1, 1), totalPages);
  const entries = catalog.entries.slice((page - 1) * pageSize, page * pageSize);
  // Skillnaden mot källan är bara sann när hela träfflistan hunnit skannas.
  const filteredOut = catalog.truncated ? undefined : Math.max(catalog.sourceTotal - total, 0);

  if (entries.length === 0) return { jobs: [], total, page, pageSize, totalPages, filteredOut };

  const adsById = await fetchWindowForEntries(filters, entries);
  const jobs = entries
    .map((entry) => adsById.get(entry.id))
    .filter((ad): ad is JobtechAd => ad !== undefined)
    .map(mapJobtechAdSummary)
    .filter((job): job is JobSummary => job !== null);

  return { jobs, total, page, pageSize, totalPages, filteredOut };
}

/**
 * Antalet träffar utan att hämta en enda annonstext. Katalogen är redan cachad
 * per filter, så en sida som ändå listar jobben betalar ingenting extra.
 */
export async function countJobs(filters: JobSearchFilters = {}) {
  const catalog = await getJobCatalog(filters);
  return catalog.entries.length;
}

export async function getJobById(id: string) {
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(id)) return null;

  const url = new URL(`/ad/${encodeURIComponent(id)}`, JOBSEARCH_BASE_URL);

  try {
    const ad = await fetchJobtech<JobtechAd>(url, 900);
    if (!matchesApprovedJobSelection(ad)) return null;
    return mapJobtechAd(ad);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") return null;
    throw error;
  }
}

async function getSitemapPage(page: number) {
  const pageSize = MAX_FETCH_LIMIT;
  const url = new URL("/search", JOBSEARCH_BASE_URL);

  url.searchParams.set("limit", String(pageSize));
  url.searchParams.set("offset", String((page - 1) * pageSize));
  url.searchParams.set("resdet", "full");
  url.searchParams.set("country", SWEDEN_CONCEPT_ID);
  url.searchParams.set("sort", "pubdate-desc");

  for (const groupId of coreOccupationGroupIds) {
    url.searchParams.append("occupation-group", groupId);
  }

  for (const occupationNameId of excludedOccupationNameIds) {
    url.searchParams.append("occupation-name", `-${occupationNameId}`);
  }

  const response = await fetchJobtech<JobtechSearchResponse>(url, 3600, SITEMAP_RESULT_FIELDS);
  const hits = response.hits ?? [];
  return {
    ads: hits.filter(matchesApprovedJobSelection),
    total: Math.max(response.total?.value ?? hits.length, 0),
  };
}

export async function getJobsForSitemap(): Promise<SitemapJob[]> {
  const firstPage = await getSitemapPage(1);
  const pageCount = Math.min(Math.max(Math.ceil(firstPage.total / MAX_FETCH_LIMIT), 1), 20);

  if (pageCount === 1) {
    return deduplicateJobtechAds(firstPage.ads)
      .map(mapJobtechSitemapJob)
      .filter((job): job is SitemapJob => job !== null);
  }

  const remainingPages = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) => getSitemapPage(index + 2)),
  );

  return deduplicateJobtechAds([firstPage, ...remainingPages].flatMap((result) => result.ads))
    .map(mapJobtechSitemapJob)
    .filter((job): job is SitemapJob => job !== null);
}
