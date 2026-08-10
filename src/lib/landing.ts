import type { OccupationCategory } from "@/config/jobs";
import type { Region } from "@/config/regions";
import type { JobSearchFilters } from "@/domain/jobs/types";
import { countJobs } from "@/integrations/jobtech/search";
import { MIN_INDEXABLE_JOB_COUNT } from "./seo";

export type LandingSearch = {
  occupation?: OccupationCategory;
  region?: Region;
  remote?: boolean;
};

/**
 * Landningssidan, dess metadata och sitemapen frågar efter samma träffar.
 * Katalogens cache-nyckel byggs av filtrens JSON, så minsta skillnad i formen –
 * till exempel remote: false mot utelämnat – ger en ny nyckel och en ny
 * skanning. Därför byggs filtren på ett enda ställe.
 */
export function landingFilters({ occupation, region, remote = false }: LandingSearch): JobSearchFilters {
  return {
    query: occupation?.query,
    occupationGroupIds: occupation?.groupIds,
    occupationNameIds: occupation?.occupationNameIds,
    regionId: region?.conceptId,
    remote,
    sort: "pubdate-desc",
  };
}

/**
 * Sidans robots-tagg och sitemapen måste vara överens – en länkad sida som
 * ändå säger noindex är en motstridig signal. Båda frågar därför här.
 * Fel får slå igenom: sidan väljer att svara noindex, medan sitemapen hellre
 * svarar 503 än att utelämna sidor som egentligen finns.
 */
export async function isIndexableLanding(search: LandingSearch) {
  return (await countJobs(landingFilters(search))) >= MIN_INDEXABLE_JOB_COUNT;
}
