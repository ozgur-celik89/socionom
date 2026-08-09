import type { JobSearchFilters } from "@/domain/jobs/types";
import { coreOccupationGroupIds, excludedOccupationNameIds } from "@/config/jobs";

export const JOBSEARCH_BASE_URL = "https://jobsearch.api.jobtechdev.se";
export const SWEDEN_CONCEPT_ID = "i46j_HmG_v64";
/** JobSearch vägrar offset över 2000, vilket sätter taket för hela katalogen. */
export const MAX_OFFSET = 2000;
export const MAX_FETCH_LIMIT = 100;

const REQUEST_TIMEOUT_MS = 5_000;

export class JobSearchUnavailableError extends Error {
  constructor() {
    super("JobSearch API is temporarily unavailable");
    this.name = "JobSearchUnavailableError";
  }
}

export async function fetchJobtech<T>(url: URL, revalidate: number, fields?: string): Promise<T> {
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

export function normalizeQuery(value?: string) {
  return value?.trim().replace(/\s+/g, " ").slice(0, 80) || undefined;
}

/**
 * Bygger sök-URL:en utan paginering. Samma URL används både när katalogen
 * skannas och när en enskild sida hämtas, så att träffarnas ordning – och
 * därmed de offset katalogen sparar – är identiska mellan anropen.
 */
export function buildSearchUrl(filters: JobSearchFilters) {
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

  return url;
}
