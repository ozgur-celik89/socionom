import { dateInSweden } from "@/lib/time";

export { dateInSweden };

export function isApplicationDeadlinePassed(value?: string, now = new Date()) {
  if (!value) return false;
  const deadlineDate = value.trim().match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
  if (!deadlineDate) return false;

  // Arbetsförmedlingens datum gäller hela den angivna kalenderdagen.
  return deadlineDate < dateInSweden(now);
}
