/** Varumärkesfärger som används i genererade bilder (favicon, OG-bilder). */
export const brandColors = {
  forest: "#185a4a",
  shell: "#143f35",
  shellDeep: "#0d2c25",
  blush: "#f4dce5",
  rose: "#88445c",
  sage: "#e6f0eb",
  paper: "#ffffff",
} as const;

/** Samma märke som src/app/icon.svg – två överlappande cirklar (matchning). */
export const brandMarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><defs><clipPath id="overlap"><circle cx="25" cy="32" r="15"/></clipPath></defs><rect width="64" height="64" rx="14" fill="${brandColors.forest}"/><circle cx="25" cy="32" r="15" fill="${brandColors.blush}"/><circle cx="39" cy="32" r="15" fill="${brandColors.paper}"/><g clip-path="url(#overlap)"><circle cx="39" cy="32" r="15" fill="${brandColors.rose}"/></g></svg>`;

/** Märket som data-URI, för <img> i ImageResponse (satori kan inte läsa externa filer). */
export const brandMarkDataUri = `data:image/svg+xml;base64,${Buffer.from(brandMarkSvg).toString("base64")}`;

/** Kortar text till en längd som får plats i en OG-bild, utan att klippa mitt i ett ord. */
export function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
