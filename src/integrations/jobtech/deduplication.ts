import type { JobtechAd } from "./types";

const TRACKING_QUERY_PARAMETER = /^(?:utm_.+|fbclid|gclid|mc_cid|mc_eid)$/i;

function normalizeText(value?: string | null) {
  return value
    ?.normalize("NFKC")
    .toLocaleLowerCase("sv-SE")
    .replace(/\s+/g, " ")
    .trim() ?? "";
}

function normalizePostcode(value?: string | null) {
  const digits = value?.replace(/\D+/g, "") ?? "";
  return digits.length === 5 ? digits : "";
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
 * FNV-1a. Annonstexter är långa och används bara för att jämföra annonser med
 * varandra, så en kort hash räcker och håller nere både minne och CPU.
 */
function hashText(value: string) {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(36);
}

/**
 * Returnerar alla identiteter en annons kan matchas på. Två annonser slås ihop
 * så snart de delar minst en identitet.
 *
 * Grundregeln är att olika orter är olika tjänster: ett bemanningsuppdrag som
 * publiceras i tretton städer ska synas i alla tretton. Undantaget är
 * postnumret, som pekar ut den fysiska arbetsplatsen – när två poster delar
 * postnummer är det samma tjänst även om Arbetsförmedlingen råkat märka dem
 * med varsin kommun (arbetsgivarens säte kontra arbetsplatsens).
 */
export function getJobtechDeduplicationKeys(ad: JobtechAd) {
  const title = normalizeText(ad.headline);
  const employer = normalizeText(ad.employer?.name?.trim() || ad.employer?.workplace);

  if (!title || !employer) return [];

  const deadline = normalizeText(ad.application_deadline);
  const identity = [title, employer, deadline];
  const location = normalizeText(
    ad.workplace_address?.municipality?.trim()
      || ad.workplace_address?.region?.trim()
      || ad.workplace_address?.country,
  );
  const keys: string[] = [];

  const postcode = normalizePostcode(ad.workplace_address?.postcode);
  if (postcode) keys.push(["place", ...identity, postcode].join("|"));

  const applicationUrl = normalizeApplicationUrl(ad.application_details?.url);
  if (applicationUrl) keys.push(["application", ...identity, location, applicationUrl].join("|"));

  const description = normalizeText(ad.description?.text?.trim() || ad.description?.text_formatted);
  if (description.length >= 200) {
    keys.push(["content", ...identity, location, hashText(description)].join("|"));
  }

  if (keys.length === 0 && location) keys.push(["location", ...identity, location].join("|"));

  return keys;
}

function shouldReplace(existing: JobtechAd, candidate: JobtechAd) {
  return (candidate.id ?? "").localeCompare(existing.id ?? "", "sv", { numeric: true }) > 0;
}

export type DeduplicationOutcome = {
  /** Platsen i den avdubblade listan, så att anropare kan hålla egna register i takt. */
  index: number;
  created: boolean;
  replaced: boolean;
};

export class JobtechAdDeduplicator {
  private readonly uniqueAds: JobtechAd[] = [];
  private readonly indexByKey = new Map<string, number>();

  add(ad: JobtechAd): DeduplicationOutcome {
    const keys = getJobtechDeduplicationKeys(ad);
    let index: number | undefined;

    for (const key of keys) {
      index = this.indexByKey.get(key);
      if (index !== undefined) break;
    }

    if (index === undefined) {
      index = this.uniqueAds.length;
      this.uniqueAds.push(ad);
      for (const key of keys) this.indexByKey.set(key, index);
      return { index, created: true, replaced: false };
    }

    // Nycklar som annonsen bidrar med gör att en tredje, delvis olik post kan
    // kopplas till samma tjänst längre fram i strömmen.
    for (const key of keys) {
      if (!this.indexByKey.has(key)) this.indexByKey.set(key, index);
    }

    const replaced = shouldReplace(this.uniqueAds[index], ad);
    if (replaced) this.uniqueAds[index] = ad;
    return { index, created: false, replaced };
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
