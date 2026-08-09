import { coreOccupationGroupIds, excludedOccupationNameIds } from "@/config/jobs";
import { hasMeaningfulJobTitle, isEmploymentJobTitle } from "@/domain/jobs/relevance";
import { isApplicationDeadlinePassed } from "@/domain/jobs/rules";
import type { JobtechAd } from "./types";

const CORE_OCCUPATION_GROUP_ID_SET = new Set<string>(coreOccupationGroupIds);
const EXCLUDED_OCCUPATION_NAME_ID_SET = new Set<string>(excludedOccupationNameIds);

export function matchesApprovedJobSelection(ad: JobtechAd) {
  const occupationGroupId = ad.occupation_group?.concept_id?.trim();
  const occupationNameId = ad.occupation?.concept_id?.trim();

  return Boolean(
    hasMeaningfulJobTitle(ad.headline)
    && isEmploymentJobTitle(ad.headline)
    && occupationGroupId
    && CORE_OCCUPATION_GROUP_ID_SET.has(occupationGroupId)
    && (!occupationNameId || !EXCLUDED_OCCUPATION_NAME_ID_SET.has(occupationNameId)),
  );
}

/**
 * Speglar de krav mapparna ställer innan en annons blir ett kort. Katalogen
 * måste tillämpa samma krav, annars räknas annonser som sedan faller bort och
 * sidorna blir olika långa igen.
 */
export function isRenderableJobtechAd(ad: JobtechAd) {
  const webpageUrl = typeof ad.webpage_url === "string" ? ad.webpage_url.trim() : "";

  return Boolean(
    ad.id?.trim()
    && ad.headline?.trim()
    && ad.publication_date?.trim()
    && /^https?:\/\//i.test(webpageUrl)
    && !ad.removed
    && !isApplicationDeadlinePassed(ad.application_deadline?.trim() || undefined),
  );
}
