import type { JobtechAd } from "./types";

const TRACKING_QUERY_PARAMETER = /^(?:utm_.+|fbclid|gclid|mc_cid|mc_eid)$/i;

function normalizeText(value?: string | null) {
  return value
    ?.normalize("NFKC")
    .toLocaleLowerCase("sv-SE")
    .replace(/\s+/g, " ")
    .trim() ?? "";
}

function normalizeApplicationUrl(value?: string | null) {
  if (!value) return "";

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";

    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (TRACKING_QUERY_PARAMETER.test(key)) url.searchParams.delete(key);
    }
    url.searchParams.sort();
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");

    return url.toString();
  } catch {
    return "";
  }
}

/**
 * Returns a conservative identity for records that represent the same
 * application opportunity despite having different JobSearch IDs.
 */
export function getJobtechDeduplicationKey(ad: JobtechAd) {
  const title = normalizeText(ad.headline);
  const employer = normalizeText(ad.employer?.name?.trim() || ad.employer?.workplace);
  const deadline = normalizeText(ad.application_deadline);
  const applicationUrl = normalizeApplicationUrl(ad.application_details?.url);

  if (!title || !employer) return null;

  if (applicationUrl) {
    return ["application", title, employer, deadline, applicationUrl].join("|");
  }

  const description = normalizeText(ad.description?.text?.trim() || ad.description?.text_formatted);
  const location = normalizeText(
    ad.workplace_address?.municipality?.trim()
      || ad.workplace_address?.region?.trim()
      || ad.workplace_address?.country,
  );

  if (!description || !location) return null;
  return ["content", title, employer, location, deadline, description].join("|");
}

function shouldReplace(existing: JobtechAd, candidate: JobtechAd) {
  return (candidate.id ?? "").localeCompare(existing.id ?? "", "sv", { numeric: true }) > 0;
}

class JobtechAdDeduplicator {
  private readonly uniqueAds: JobtechAd[] = [];
  private readonly indexByKey = new Map<string, number>();

  add(ad: JobtechAd) {
    const key = getJobtechDeduplicationKey(ad);
    if (!key) {
      this.uniqueAds.push(ad);
      return;
    }

    const existingIndex = this.indexByKey.get(key);
    if (existingIndex === undefined) {
      this.indexByKey.set(key, this.uniqueAds.length);
      this.uniqueAds.push(ad);
      return;
    }

    if (shouldReplace(this.uniqueAds[existingIndex], ad)) this.uniqueAds[existingIndex] = ad;
  }

  addMany(ads: JobtechAd[]) {
    for (const ad of ads) this.add(ad);
  }

  get size() {
    return this.uniqueAds.length;
  }

  toArray() {
    return [...this.uniqueAds];
  }
}

export function deduplicateJobtechAds(ads: JobtechAd[]) {
  const deduplicator = new JobtechAdDeduplicator();
  deduplicator.addMany(ads);
  return deduplicator.toArray();
}
