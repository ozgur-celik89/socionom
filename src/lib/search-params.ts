import { getOccupationCategory, getWorkingHoursOption } from "@/config/jobs";
import { getRegion } from "@/config/regions";

export type RawSearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Katalogen når som mest 2 100 annonser (JobSearch offset-tak 2 000 plus en
 * hämtning om 100), vilket med sidstorlek 20 blir 105 sidor. Ett lägre tak här
 * skulle servera sista sidans innehåll under flera adresser; taket finns bara
 * för att stoppa skräp som ?sida=999999.
 */
const MAX_PAGE = 105;

export function parsePage(value: string | string[] | undefined) {
  const parsed = Number.parseInt(single(value) ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, MAX_PAGE) : 1;
}

export function parseJobSearchParams(params: RawSearchParams) {
  const query = single(params.q)?.trim().replace(/\s+/g, " ").slice(0, 80) || undefined;
  const occupation = getOccupationCategory(single(params.yrke) ?? "");
  const region = getRegion(single(params.region) ?? "");
  const workingHours = getWorkingHoursOption(single(params.anstallning) ?? "");
  const sortValue = single(params.sort);
  const sort = sortValue === "senaste"
    ? "pubdate-desc" as const
    : sortValue === "deadline"
      ? "applydate-asc" as const
      : query
        ? "relevance" as const
        : "pubdate-desc" as const;

  return {
    query,
    occupation,
    region,
    workingHours,
    remote: single(params.distans) === "1",
    sort,
    sortValue,
    page: parsePage(params.sida),
  };
}

export function toPaginationParams(params: RawSearchParams) {
  const result = new URLSearchParams();
  const allowedKeys = new Set(["q", "yrke", "region", "anstallning", "distans", "sort"]);

  for (const [key, value] of Object.entries(params)) {
    if (!allowedKeys.has(key)) continue;
    const current = single(value);
    if (current) result.set(key, current);
  }

  return result;
}

export function hasSearchParams(params: RawSearchParams) {
  return Object.values(params).some((value) => Array.isArray(value) ? value.length > 0 : Boolean(value));
}
