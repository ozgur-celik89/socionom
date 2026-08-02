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

/** Samma bokstavsfria portföljmärke som src/app/icon.svg (matchning). */
export const brandMarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><path d="M22 21v-4.5A7.5 7.5 0 0 1 29.5 9h5a7.5 7.5 0 0 1 7.5 7.5V21h-7v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v4h-7Z" fill="${brandColors.forest}"/><rect x="6" y="19" width="52" height="38" rx="10" fill="${brandColors.forest}"/><path d="M6 31.5h52" stroke="${brandColors.shell}" stroke-width="3"/><rect x="27" y="28" width="10" height="9" rx="2.5" fill="${brandColors.shell}"/></svg>`;

/** Märket som data-URI, för <img> i ImageResponse (satori kan inte läsa externa filer). */
export const brandMarkDataUri = `data:image/svg+xml;base64,${Buffer.from(brandMarkSvg).toString("base64")}`;

/** Kortar text till en längd som får plats i en OG-bild, utan att klippa mitt i ett ord. */
export function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
