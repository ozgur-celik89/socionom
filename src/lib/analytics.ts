import { occupationCategories, workingHoursOptions } from "@/config/jobs";
import { regions } from "@/config/regions";

const occupationSlugs = new Set(occupationCategories.map((item) => item.slug));
const regionSlugs = new Set(regions.map((item) => item.slug));
const workingHoursSlugs = new Set<string>(workingHoursOptions.map((item) => item.slug));
const sortValues = new Set<string>(["senaste", "deadline"]);

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function getSearchAnalyticsProperties({
  query,
  occupation,
  region,
  workingHours,
  remote,
  sort,
  source,
}: {
  query: unknown;
  occupation: unknown;
  region: unknown;
  workingHours: unknown;
  remote: unknown;
  sort: unknown;
  source: "hero" | "full";
}) {
  const hasQuery = Boolean(stringValue(query));
  const occupationValue = stringValue(occupation);
  const regionValue = stringValue(region);
  const workingHoursValue = stringValue(workingHours);
  const sortValue = stringValue(sort);
  const hasRemoteFilter = stringValue(remote) === "1";
  const validOccupation = occupationSlugs.has(occupationValue) ? occupationValue : "alla";
  const validRegion = regionSlugs.has(regionValue) ? regionValue : "hela_sverige";
  const validWorkingHours = workingHoursSlugs.has(workingHoursValue) ? workingHoursValue : "alla";
  const validSort = sortValues.has(sortValue)
    ? sortValue
    : hasQuery
      ? "relevans"
      : "senaste";
  const filterCount = [
    validOccupation !== "alla",
    validRegion !== "hela_sverige",
    validWorkingHours !== "alla",
    hasRemoteFilter,
  ].filter(Boolean).length;

  return {
    source,
    has_query: hasQuery,
    filter_count: filterCount,
    occupation: validOccupation,
    region: validRegion,
    working_hours: validWorkingHours,
    remote: hasRemoteFilter,
    sort: validSort,
  };
}
