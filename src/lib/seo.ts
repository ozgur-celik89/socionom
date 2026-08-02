import type { Job } from "@/domain/jobs/types";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { siteConfig } from "@/config/site";

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
  const address = {
    "@type": "PostalAddress",
    addressLocality: location?.city ?? location?.municipality,
    addressRegion: location?.region,
    postalCode: location?.postcode,
    addressCountry: location?.countryCode ?? "SE",
  };

  const workingHours = job.workingHours?.toLocaleLowerCase("sv-SE") ?? "";
  const employmentTypes = [
    ...(workingHours.includes("heltid") ? ["FULL_TIME"] : []),
    ...(workingHours.includes("deltid") ? ["PART_TIME"] : []),
  ];

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
