import { isApplicationDeadlinePassed } from "@/domain/jobs/rules";
import { slugify } from "@/lib/slug";
import { matchesApprovedJobSelection } from "./selection";
import type { JobtechSearchResponse } from "./types";

const JOBSEARCH_BASE_URL = "https://jobsearch.api.jobtechdev.se";
const REQUEST_TIMEOUT_MS = 3_000;
const CANONICAL_JOB_FIELDS = [
  "hits{id,headline,application_deadline,removed,occupation{concept_id},occupation_group{concept_id}}",
].join(",");

/**
 * Lättviktsuppslag för dokumentförfrågningar i Proxy. Proxy har ingen beständig
 * fetch-cache, så svaret hålls minimalt och retry lämnas till den riktiga sidan.
 */
export async function getCanonicalJobSlug(id: string) {
  if (!/^\d{1,64}$/.test(id)) return null;

  // /ad/{id} returnerar alltid hela annonsen. Den enkla sökningen kan slå upp
  // annons-ID:t och respekterar X-Fields, vilket undviker den stora beskrivningen.
  const url = new URL("/search", JOBSEARCH_BASE_URL);
  url.searchParams.set("q", id);
  url.searchParams.set("limit", "10");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Fields": CANONICAL_JOB_FIELDS,
      "x-feature-disable-smart-freetext": "true",
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error("JobSearch canonical lookup failed");

  const result = (await response.json()) as JobtechSearchResponse;
  const ad = result.hits?.find((hit) => hit.id === id);
  if (!ad) return null;

  const title = ad.headline?.trim();

  if (
    !matchesApprovedJobSelection(ad)
    || !title
    || ad.removed
    || isApplicationDeadlinePassed(ad.application_deadline ?? undefined)
  ) return null;

  return slugify(title);
}
