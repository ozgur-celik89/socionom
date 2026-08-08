import { coreOccupationGroupIds, excludedOccupationNameIds } from "@/config/jobs";
import { hasMeaningfulJobTitle, isEmploymentJobTitle } from "@/domain/jobs/relevance";
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
