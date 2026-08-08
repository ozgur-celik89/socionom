const INVALID_JOB_TITLES = new Set([
  "annons",
  "jobb",
  "ledig tjanst",
  "ledigt jobb",
  "platsannons",
  "standard",
  "test",
  "testannons",
  "tjanst",
]);

// Uppdrag som publiceras som annonser men inte är anställningar.
const NON_EMPLOYMENT_TITLES = new Set([
  "familjehem",
]);

function normalizeTitle(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("sv-SE")
    .replace(/[^a-z0-9åäö]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function hasMeaningfulJobTitle(value?: string | null) {
  if (!value?.trim()) return false;

  const normalizedTitle = normalizeTitle(value);
  return normalizedTitle.length >= 3 && !INVALID_JOB_TITLES.has(normalizedTitle);
}

export function isEmploymentJobTitle(value?: string | null) {
  if (!value?.trim()) return false;
  return !NON_EMPLOYMENT_TITLES.has(normalizeTitle(value));
}
