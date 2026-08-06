import sanitizeHtml from "sanitize-html";
import type { Job, JobLocation, JobSummary, SitemapJob } from "@/domain/jobs/types";
import { isApplicationDeadlinePassed } from "@/domain/jobs/rules";
import { slugify } from "@/lib/slug";
import type { JobtechAd } from "./types";

const REMOTE_PATTERN = /(?:distansarbete|arbete på distans|arbeta på distans|jobba på distans|hemifrån|remote work|delvis på distans)/i;

function safeHttpUrl(value: unknown) {
  if (typeof value !== "string") return undefined;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function sanitizeDescription(formatted?: string | null, plain?: string | null) {
  const source = formatted?.trim();

  if (source) {
    const cleanFormatted = sanitizeHtml(source, {
      allowedTags: ["p", "br", "ul", "ol", "li", "strong", "em", "b", "i", "u", "a", "h2", "h3"],
      allowedAttributes: {
        a: ["href", "title", "target", "rel"],
      },
      allowedSchemes: ["http", "https", "mailto"],
      transformTags: {
        a: (_tagName, attribs) => ({
          tagName: "a",
          attribs: {
            ...attribs,
            target: "_blank",
            rel: "nofollow noopener noreferrer",
          },
        }),
      },
    });

    if (cleanFormatted && !/<(?:p|ul|ol|h2|h3)\b/i.test(cleanFormatted)) {
      return `<p>${cleanFormatted.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>")}</p>`;
    }

    if (cleanFormatted) return cleanFormatted;
  }

  const cleanText = sanitizeHtml(plain ?? "", { allowedTags: [], allowedAttributes: {} }).trim();
  if (!cleanText) return "<p>Arbetsgivaren har inte lämnat någon fullständig beskrivning.</p>";

  return cleanText
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function descriptionAsText(formatted?: string | null, plain?: string | null) {
  const plainText = plain?.trim();
  if (plainText) return plainText;

  return sanitizeHtml(formatted ?? "", {
    allowedTags: [],
    allowedAttributes: {},
  }).replace(/\s+/g, " ").trim();
}

function normalizeCountryCode(countryCode?: string | null, country?: string | null) {
  const normalizedCode = countryCode?.trim().toUpperCase();
  if (normalizedCode && /^[A-Z]{2}$/.test(normalizedCode)) return normalizedCode;

  const normalizedCountry = country?.trim().toLocaleLowerCase("sv-SE");
  if (normalizedCode === "199" || normalizedCountry === "sverige" || normalizedCountry === "sweden") {
    return "SE";
  }

  return undefined;
}

function mapLocation(ad: JobtechAd): JobLocation {
  const address = ad.workplace_address;
  const country = address?.country?.trim() || "Sverige";
  const coordinates =
    Array.isArray(address?.coordinates) && address.coordinates.length === 2
      ? ([address.coordinates[0], address.coordinates[1]] as [number, number])
      : undefined;

  return {
    municipality: address?.municipality ?? undefined,
    municipalityConceptId: address?.municipality_concept_id ?? undefined,
    region: address?.region ?? undefined,
    regionConceptId: address?.region_concept_id ?? undefined,
    city: address?.city ?? undefined,
    streetAddress: address?.street_address ?? undefined,
    postcode: address?.postcode ?? undefined,
    country,
    countryCode: normalizeCountryCode(address?.country_code, address?.country)
      ?? (address?.country ? undefined : "SE"),
    coordinates,
  };
}

export function mapJobtechAd(ad: JobtechAd): Job | null {
  const id = ad.id?.trim();
  const title = ad.headline?.trim();
  const publishedAt = ad.publication_date?.trim();
  const sourceUrl = safeHttpUrl(ad.webpage_url);
  const expiresAt = ad.application_deadline?.trim() || undefined;

  if (!id || !title || !publishedAt || !sourceUrl || ad.removed || isApplicationDeadlinePassed(expiresAt)) return null;

  const descriptionText = descriptionAsText(ad.description?.text_formatted, ad.description?.text);
  if (!descriptionText) return null;
  const applyUrl = safeHttpUrl(ad.application_details?.url) ?? sourceUrl;
  const employerName = ad.employer?.name?.trim() || ad.employer?.workplace?.trim() || "Arbetsgivare ej angiven";
  const occupationConceptIds = [
    ad.occupation?.concept_id,
    ad.occupation_group?.concept_id,
    ad.occupation_field?.concept_id,
  ].filter((value): value is string => Boolean(value));

  return {
    id,
    source: "arbetsformedlingen",
    slug: slugify(title),
    title,
    descriptionHtml: sanitizeDescription(ad.description?.text_formatted, descriptionText),
    descriptionText,
    employerName,
    employerUrl: safeHttpUrl(ad.employer?.url),
    logoUrl: safeHttpUrl(ad.logo_url),
    locations: [mapLocation(ad)],
    occupationConceptIds,
    occupationLabel: ad.occupation?.label ?? undefined,
    occupationGroupLabel: ad.occupation_group?.label ?? undefined,
    employmentType: ad.employment_type?.label ?? undefined,
    employmentTypeConceptId: ad.employment_type?.concept_id ?? undefined,
    duration: ad.duration?.label ?? undefined,
    workingHours: ad.working_hours_type?.label ?? undefined,
    scopeMin: ad.scope_of_work?.min ?? undefined,
    scopeMax: ad.scope_of_work?.max ?? undefined,
    remote: ad.remote ?? REMOTE_PATTERN.test(`${title} ${descriptionText}`),
    publishedAt,
    expiresAt,
    applyUrl,
    sourceUrl,
    sourceUpdatedAt: ad.timestamp ? new Date(ad.timestamp).toISOString() : publishedAt,
    vacancies: ad.number_of_vacancies ?? undefined,
  };
}

export function mapJobtechAdSummary(ad: JobtechAd): JobSummary | null {
  const id = ad.id?.trim();
  const title = ad.headline?.trim();
  const publishedAt = ad.publication_date?.trim();
  const expiresAt = ad.application_deadline?.trim() || undefined;

  if (
    !id
    || !title
    || !publishedAt
    || !safeHttpUrl(ad.webpage_url)
    || ad.removed
    || isApplicationDeadlinePassed(expiresAt)
  ) return null;

  const employerName = ad.employer?.name?.trim() || ad.employer?.workplace?.trim() || "Arbetsgivare ej angiven";
  const remoteSearchText = ad.description?.text?.trim() ?? "";

  return {
    id,
    source: "arbetsformedlingen",
    slug: slugify(title),
    title,
    employerName,
    logoUrl: safeHttpUrl(ad.logo_url),
    locations: [mapLocation(ad)],
    employmentType: ad.employment_type?.label ?? undefined,
    duration: ad.duration?.label ?? undefined,
    workingHours: ad.working_hours_type?.label ?? undefined,
    scopeMin: ad.scope_of_work?.min ?? undefined,
    scopeMax: ad.scope_of_work?.max ?? undefined,
    remote: ad.remote ?? REMOTE_PATTERN.test(`${title} ${remoteSearchText}`),
    publishedAt,
    expiresAt,
  };
}

export function mapJobtechSitemapJob(ad: JobtechAd): SitemapJob | null {
  const id = ad.id?.trim();
  const title = ad.headline?.trim();
  const publishedAt = ad.publication_date?.trim();
  const expiresAt = ad.application_deadline?.trim() || undefined;

  if (!id || !title || !publishedAt || ad.removed || isApplicationDeadlinePassed(expiresAt)) return null;

  return {
    id,
    slug: slugify(title),
    sourceUpdatedAt: ad.timestamp ? new Date(ad.timestamp).toISOString() : publishedAt,
  };
}
