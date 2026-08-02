const swedenDateFormatter = new Intl.DateTimeFormat("sv-SE", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Europe/Stockholm",
  year: "numeric",
});

export function dateInSweden(now = new Date()) {
  const parts = Object.fromEntries(
    swedenDateFormatter.formatToParts(now).map((part) => [part.type, part.value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function isApplicationDeadlinePassed(value?: string, now = new Date()) {
  if (!value) return false;
  const deadlineDate = value.trim().match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
  if (!deadlineDate) return false;

  // Arbetsförmedlingens datum gäller hela den angivna kalenderdagen.
  return deadlineDate < dateInSweden(now);
}

