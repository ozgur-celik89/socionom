import type { JobSearchFilters, JobSearchResult, SitemapJob } from "@/domain/jobs/types";
import { coreOccupationGroupIds, excludedOccupationNameIds } from "@/config/jobs";
import { mapJobtechAd, mapJobtechAdSummary, mapJobtechSitemapJob } from "./mapper";
import { deduplicateJobtechAds } from "./deduplication";
import { matchesApprovedJobSelection } from "./selection";
import type { JobtechAd, JobtechSearchResponse } from "./types";

const JOBSEARCH_BASE_URL = "https://jobsearch.api.jobtechdev.se";
const SWEDEN_CONCEPT_ID = "i46j_HmG_v64";
const DEFAULT_PAGE_SIZE = 20;
const MAX_OFFSET = 2000;
const REQUEST_TIMEOUT_MS = 5_000;
const TOTAL_RESULT_FIELDS = "total{value}";
const SEARCH_RESULT_FIELDS = [
  "hits{id,webpage_url,logo_url,headline,application_deadline,application_details{url},description{text},employment_type{label},duration{label},working_hours_type{label},scope_of_work{min,max},employer{name,workplace},occupation{concept_id},occupation_group{concept_id},workplace_address{municipality,municipality_concept_id,region,region_concept_id,country,country_code,city},publication_date,removed}",
].join(",");
const SITEMAP_RESULT_FIELDS = [
  "total{value}",
  "hits{id,headline,application_deadline,application_details{url},employer{name,workplace},publication_date,removed,timestamp,occupation{concept_id},occupation_group{concept_id}}",
].join(",");

export class JobSearchUnavailableError extends Error {
  constructor() {
    super("JobSearch API is temporarily unavailable");
    this.name = "JobSearchUnavailableError";
  }
}

function normalizeQuery(value?: string) {
  return value?.trim().replace(/\s+/g, " ").slice(0, 80) || undefined;
}

async function fetchJobtech<T>(url: URL, revalidate: number, fields?: string): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          ...(fields ? { "X-Fields": fields } : {}),
        },
        next: { revalidate },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (response.ok) return (await response.json()) as T;
      if (response.status === 404) throw new Error("NOT_FOUND");
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") throw error;
      if (attempt === 1) throw new JobSearchUnavailableError();
    }
  }

  throw new JobSearchUnavailableError();
}

export async function searchJobs(filters: JobSearchFilters = {}): Promise<JobSearchResult> {
  const pageSize = Math.min(Math.max(filters.pageSize ?? DEFAULT_PAGE_SIZE, 1), 100);
  const maxPage = Math.floor(MAX_OFFSET / pageSize) + 1;
  const page = Math.min(Math.max(filters.page ?? 1, 1), maxPage);
  const query = normalizeQuery(filters.query);
  const url = new URL("/search", JOBSEARCH_BASE_URL);

  url.searchParams.set("resdet", "full");
  // JobSearch behandlar geografiska nivåer som alternativa träffar. Om både
  // Sverige och ett län skickas blir hela Sverige kvar i resultatet.
  if (!filters.regionId) url.searchParams.set("country", SWEDEN_CONCEPT_ID);
  url.searchParams.set("sort", filters.sort ?? (query ? "relevance" : "pubdate-desc"));

  const positiveOccupationNameIds = filters.occupationNameIds ?? [];
  if (positiveOccupationNameIds.length > 0) {
    // JobSearch behandlar occupation-group och occupation-name som alternativa
    // träffar. Den breda gruppen måste därför utelämnas när benämningen ska
    // avgränsa en redaktionell landningssida.
    for (const occupationNameId of positiveOccupationNameIds) {
      url.searchParams.append("occupation-name", occupationNameId);
    }
  } else {
    for (const groupId of filters.occupationGroupIds ?? coreOccupationGroupIds) {
      url.searchParams.append("occupation-group", groupId);
    }

    for (const occupationNameId of excludedOccupationNameIds) {
      url.searchParams.append("occupation-name", `-${occupationNameId}`);
    }
  }

  if (query) url.searchParams.set("q", query);
  if (filters.regionId) url.searchParams.set("region", filters.regionId);
  if (filters.worktimeExtentId) url.searchParams.set("worktime-extent", filters.worktimeExtentId);
  if (filters.remote) url.searchParams.set("remote", "true");

  const totalUrl = new URL(url);
  totalUrl.searchParams.set("limit", "1");
  totalUrl.searchParams.set("offset", "0");
  const pageUrl = new URL(url);
  pageUrl.searchParams.set("limit", String(pageSize));
  pageUrl.searchParams.set("offset", String((page - 1) * pageSize));
  const [totalResponse, pageResponse] = await Promise.all([
    fetchJobtech<JobtechSearchResponse>(totalUrl, 600, TOTAL_RESULT_FIELDS),
    fetchJobtech<JobtechSearchResponse>(pageUrl, 600, SEARCH_RESULT_FIELDS),
  ]);
  const total = Math.max(
    totalResponse.total?.value ?? pageResponse.hits?.length ?? 0,
    0,
  );
  const jobs = deduplicateJobtechAds(
    (pageResponse.hits ?? []).filter(matchesApprovedJobSelection),
  )
    .map(mapJobtechAdSummary)
    .filter((job) => job !== null);
  const reachableTotal = Math.min(total, MAX_OFFSET + pageSize);

  return {
    jobs,
    total,
    page,
    pageSize,
    totalPages: Math.max(Math.ceil(reachableTotal / pageSize), 1),
  };
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
  const pageSize = 100;
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
  const pageCount = Math.min(Math.max(Math.ceil(firstPage.total / 100), 1), 20);

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
