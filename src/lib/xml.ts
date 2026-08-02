export function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function xmlResponse(
  xml: string,
  options: { status?: number; cacheControl?: string } = {},
) {
  return new Response(xml, {
    status: options.status,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": options.cacheControl ?? "public, s-maxage=600, stale-while-revalidate=86400",
    },
  });
}
