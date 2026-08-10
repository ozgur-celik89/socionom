import type { Job } from "@/domain/jobs/types";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { siteConfig } from "@/config/site";

/**
 * Kombinationssidorna för yrke och region är bara meningsfulla i index när de
 * har tillräckligt med annonser för att svara på det besökaren sökte efter. En
 * sida med ett par träffar är tunn och drar ner sajtens kvalitet som helhet.
 */
export const MIN_INDEXABLE_JOB_COUNT = 5;

const TEMPORARY_EMPLOYMENT_TYPE_IDS = new Set([
  "sTu5_NBQ_udq", // Tidsbegränsad anställning
  "gro4_cWF_6D7", // Vikariat
  "EBhX_Qm2_8eX", // Säsongsanställning
]);
const OTHER_EMPLOYMENT_TYPE_IDS = new Set([
  "kpPX_CNN_gDU", // Tillsvidareanställning
  "1paU_aCR_nGn", // Behovsanställning
]);

function googleEmploymentType(job: Job) {
  const workingHours = job.workingHours?.toLocaleLowerCase("sv-SE") ?? "";
  const employmentTypes = [
    ...(workingHours.includes("heltid") ? ["FULL_TIME"] : []),
    ...(workingHours.includes("deltid") ? ["PART_TIME"] : []),
  ];

  if (employmentTypes.length > 0) return employmentTypes;

  const sourceType = job.employmentType?.toLocaleLowerCase("sv-SE") ?? "";
  if (
    (job.employmentTypeConceptId && TEMPORARY_EMPLOYMENT_TYPE_IDS.has(job.employmentTypeConceptId))
    || /tidsbegränsad|vikariat|säsongsanställning/.test(sourceType)
  ) {
    return ["TEMPORARY"];
  }

  if (
    (job.employmentTypeConceptId && OTHER_EMPLOYMENT_TYPE_IDS.has(job.employmentTypeConceptId))
    || /tills\s*vidare|tillsvidare|behovsanställning/.test(sourceType)
  ) {
    return ["OTHER"];
  }

  return [];
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: new URL(item.href, siteConfig.url).toString() } : {}),
    })),
  };
}

export function jobPostingJsonLd(job: Job) {
  const location = job.locations[0];
  const addressLocality = location?.city ?? location?.municipality;
  const address = {
    "@type": "PostalAddress",
    ...(location?.streetAddress ? { streetAddress: location.streetAddress } : {}),
    ...(addressLocality ? { addressLocality } : {}),
    ...(location?.region ? { addressRegion: location.region } : {}),
    ...(location?.postcode ? { postalCode: location.postcode } : {}),
    addressCountry: location?.countryCode ?? "SE",
  };

  const employmentTypes = googleEmploymentType(job);

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.descriptionHtml,
    identifier: {
      "@type": "PropertyValue",
      name: "Arbetsförmedlingen",
      value: job.id,
    },
    datePosted: job.publishedAt,
    ...(job.expiresAt ? { validThrough: job.expiresAt } : {}),
    ...(employmentTypes.length === 1 ? { employmentType: employmentTypes[0] } : {}),
    ...(employmentTypes.length > 1 ? { employmentType: employmentTypes } : {}),
    directApply: false,
    hiringOrganization: {
      "@type": "Organization",
      name: job.employerName,
      ...(job.employerUrl ? { sameAs: job.employerUrl } : {}),
      ...(job.logoUrl ? { logo: job.logoUrl } : {}),
    },
    jobLocation: {
      "@type": "Place",
      address,
    },
    url: `${siteConfig.url}/lediga-jobb/${job.id}/${job.slug}`,
  };
}
