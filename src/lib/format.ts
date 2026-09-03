import { parseSwedishTimestamp, swedishDayDifference } from "./time";

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
  const date = parseSwedishTimestamp(value);
  return date ? dateFormatter.format(date) : undefined;
}

export function formatPublishedDate(value: string) {
  const date = parseSwedishTimestamp(value);
  if (!date) return "Publicerad nyligen";

  const days = swedishDayDifference(date, new Date());
  if (days <= 0 && days >= -6) return `Publicerad ${relativeFormatter.format(days, "day")}`;

  return `Publicerad ${dateFormatter.format(date)}`;
}

export function isRecentlyPublished(value: string, days = 3) {
  const published = parseSwedishTimestamp(value);
  if (!published) return false;

  const age = Date.now() - published.getTime();
  return age >= 0 && age <= days * 86_400_000;
}

export function formatScope(min?: number, max?: number) {
  if (min == null && max == null) return undefined;
  if (min === max) return `${min} %`;
  if (min != null && max != null) return `${min}–${max} %`;
  return `${min ?? max} %`;
}
