const SWEDEN_TIME_ZONE = "Europe/Stockholm";
const DAY_MS = 86_400_000;

const swedenPartsFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: SWEDEN_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
  minute: "2-digit",
  second: "2-digit",
});

const NAIVE_TIMESTAMP = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/;
const HAS_TIME_ZONE = /(?:Z|[+-]\d{2}:?\d{2})$/i;

function swedenParts(instant: Date) {
  const parts = swedenPartsFormatter.formatToParts(instant);
  return Object.fromEntries(parts.map((part) => [part.type, part.value])) as Record<string, string>;
}

/** Hur många millisekunder svensk tid ligger före UTC vid en given tidpunkt. */
function swedenOffsetMs(instant: Date) {
  const { year, month, day, hour, minute, second } = swedenParts(instant);
  const asUtc = Date.UTC(+year, +month - 1, +day, +hour, +minute, +second);

  // Delarna har sekundupplösning, så tidpunkten jämförs på samma nivå.
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

export function dateInSweden(now = new Date()) {
  const { year, month, day } = swedenParts(now);
  return `${year}-${month}-${day}`;
}

/**
 * JobSearch skickar lokal svensk tid utan tidszon: "2026-09-03T10:29:03".
 * new Date() tolkar en sådan sträng som serverns lokaltid, och servern kör UTC
 * i drift – varje annons hamnar då en till två timmar fram i tiden. Lokalt,
 * med svensk tidszon, syns felet inte alls.
 */
export function parseSwedishTimestamp(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  if (HAS_TIME_ZONE.test(trimmed)) {
    const explicit = new Date(trimmed);
    return Number.isNaN(explicit.getTime()) ? null : explicit;
  }

  const match = trimmed.match(NAIVE_TIMESTAMP);
  if (!match) return null;

  const [, year, month, day, hour = "00", minute = "00", second = "00"] = match;
  if (+month < 1 || +month > 12 || +day < 1 || +day > 31) return null;

  const naive = Date.UTC(+year, +month - 1, +day, +hour, +minute, +second);
  // Förskjutningen beror på vilken tidpunkt det faktiskt är. Första gissningen
  // använder fel förskjutning kring sommartidsskiftet, så den räknas om en gång.
  const estimate = naive - swedenOffsetMs(new Date(naive));

  return new Date(naive - swedenOffsetMs(new Date(estimate)));
}

/** Samma tidpunkt som en fullständig ISO-sträng, för sitemap och strukturerad data. */
export function toIsoTimestamp(value?: string | null) {
  return parseSwedishTimestamp(value)?.toISOString();
}

/**
 * Skillnaden i svenska kalenderdygn, negativ bakåt i tiden. En annons från i går
 * kväll ska säga "i går" även när den bara är nio timmar gammal.
 */
export function swedishDayDifference(from: Date, to: Date) {
  const fromDay = Date.parse(`${dateInSweden(from)}T00:00:00Z`);
  const toDay = Date.parse(`${dateInSweden(to)}T00:00:00Z`);

  return Math.round((fromDay - toDay) / DAY_MS);
}
