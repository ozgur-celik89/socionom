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
