import type { JobSearchFilters, JobSearchResult } from "@/domain/jobs/types";
import { coreOccupationGroupIds, excludedOccupationNameIds } from "@/config/jobs";
import { isApplicationDeadlinePassed } from "@/domain/jobs/rules";
import { slugify } from "@/lib/slug";
import { mapJobtechAd } from "./mapper";
import type { JobtechAd, JobtechSearchResponse } from "./types";

const JOBSEARCH_BASE_URL = "https://jobsearch.api.jobtechdev.se";
const SWEDEN_CONCEPT_ID = "i46j_HmG_v64";
const DEFAULT_PAGE_SIZE = 20;
const MAX_OFFSET = 2000;
const CORE_OCCUPATION_GROUP_ID_SET = new Set<string>(coreOccupationGroupIds);
const EXCLUDED_OCCUPATION_NAME_ID_SET = new Set<string>(excludedOccupationNameIds);

export class JobSearchUnavailableError extends Error {
  constructor() {
    super("JobSearch API is temporarily unavailable");
    this.name = "JobSearchUnavailableError";
  }
}

function normalizeQuery(value?: string) {
  return value?.trim().replace(/\s+/g, " ").slice(0, 80) || undefined;
}

function matchesApprovedJobSelection(ad: JobtechAd) {
  const occupationGroupId = ad.occupation_group?.concept_id?.trim();
  const occupationNameId = ad.occupation?.concept_id?.trim();

  return Boolean(
    occupationGroupId
    && CORE_OCCUPATION_GROUP_ID_SET.has(occupationGroupId)
    && (!occupationNameId || !EXCLUDED_OCCUPATION_NAME_ID_SET.has(occupationNameId)),
  );
}

async function fetchJobtech<T>(url: URL, revalidate: number): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        next: { revalidate },
        signal: AbortSignal.timeout(8_000),
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

  url.searchParams.set("limit", String(pageSize));
  url.searchParams.set("offset", String((page - 1) * pageSize));
  url.searchParams.set("resdet", "full");
  // JobSearch behandlar geografiska nivåer som alternativa träffar. Om både
  // Sverige och ett län skickas blir hela Sverige kvar i resultatet.
  if (!filters.regionId) url.searchParams.set("country", SWEDEN_CONCEPT_ID);
  url.searchParams.set("sort", filters.sort ?? (query ? "relevance" : "pubdate-desc"));

  for (const groupId of filters.occupationGroupIds ?? coreOccupationGroupIds) {
    url.searchParams.append("occupation-group", groupId);
  }

  for (const occupationNameId of excludedOccupationNameIds) {
    url.searchParams.append("occupation-name", `-${occupationNameId}`);
  }

  if (query) url.searchParams.set("q", query);
  if (filters.regionId) url.searchParams.set("region", filters.regionId);
  if (filters.worktimeExtentId) url.searchParams.set("worktime-extent", filters.worktimeExtentId);
  if (filters.remote) url.searchParams.set("remote", "true");

  const response = await fetchJobtech<JobtechSearchResponse>(url, 600);
  const jobs = (response.hits ?? [])
    .filter(matchesApprovedJobSelection)
    .map(mapJobtechAd)
    .filter((job) => job !== null);
  const total = Math.max(response.total?.value ?? jobs.length, 0);
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

export async function getCanonicalJobSlug(id: string) {
  if (!/^\d{1,64}$/.test(id)) return null;

  const url = new URL(`/ad/${encodeURIComponent(id)}`, JOBSEARCH_BASE_URL);

  try {
    const ad = await fetchJobtech<JobtechAd>(url, 900);
    const title = ad.headline?.trim();
    if (
      !matchesApprovedJobSelection(ad)
      || !title
      || ad.removed
      || isApplicationDeadlinePassed(ad.application_deadline ?? undefined)
    ) return null;
    return slugify(title);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") return null;
    throw error;
  }
}

export async function getJobsForSitemap() {
  const firstPage = await searchJobs({ page: 1, pageSize: 100, sort: "pubdate-desc" });
  const pageCount = Math.min(firstPage.totalPages, 20);

  if (pageCount === 1) return firstPage.jobs;

  const remainingPages = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) =>
      searchJobs({ page: index + 2, pageSize: 100, sort: "pubdate-desc" }),
    ),
  );

  return [firstPage, ...remainingPages].flatMap((result) => result.jobs);
}
