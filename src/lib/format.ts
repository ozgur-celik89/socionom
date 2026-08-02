const dateFormatter = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Stockholm",
});

const relativeFormatter = new Intl.RelativeTimeFormat("sv-SE", { numeric: "auto" });
const numberFormatter = new Intl.NumberFormat("sv-SE");

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

export function formatDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return dateFormatter.format(date);
}

export function formatPublishedDate(value: string) {
  const date = new Date(value);
  const now = new Date();
  const diffDays = Math.round((date.getTime() - now.getTime()) / 86_400_000);

  if (Number.isFinite(diffDays) && diffDays <= 0 && diffDays >= -6) {
    return `Publicerad ${relativeFormatter.format(diffDays, "day")}`;
  }

  return `Publicerad ${formatDate(value) ?? "nyligen"}`;
}

export function isRecentlyPublished(value: string, days = 3) {
  const published = new Date(value).getTime();
  if (Number.isNaN(published)) return false;
  const age = Date.now() - published;
  return age >= 0 && age <= days * 86_400_000;
}

export function formatScope(min?: number, max?: number) {
  if (min == null && max == null) return undefined;
  if (min === max) return `${min} %`;
  if (min != null && max != null) return `${min}–${max} %`;
  return `${min ?? max} %`;
}
