import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getOccupationCategory } from "@/config/jobs";
import { getRegion } from "@/config/regions";
import { getCanonicalJobSlug } from "@/integrations/jobtech/canonical";

const JOB_PATH = /^\/lediga-jobb\/(\d{1,64})\/([^/]+)$/;
const OCCUPATION_PATH = /^\/lediga-jobb\/yrke\/([^/]+)(?:\/([^/]+))?$/;
const REGION_PATH = /^\/lediga-jobb\/ort\/([^/]+)$/;

function isClientRouterRequest(request: NextRequest) {
  return request.headers.get("rsc") === "1"
    || request.headers.get("next-router-prefetch") === "1"
    || request.headers.has("next-router-segment-prefetch")
    || request.headers.get("purpose")?.toLowerCase() === "prefetch"
    || request.headers.get("sec-purpose")?.toLowerCase().includes("prefetch");
}

function notFound(request: NextRequest) {
  const notFoundUrl = request.nextUrl.clone();
  notFoundUrl.pathname = "/_not-found";
  notFoundUrl.search = "";
  return NextResponse.rewrite(notFoundUrl, { status: 404 });
}

export async function proxy(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") return NextResponse.next();
  // Klientnavigering valideras redan av sidan. Proxy behövs bara för att
  // direkta dokumentförfrågningar ska få en riktig HTTP 308 eller 404.
  if (isClientRouterRequest(request)) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // notFound() inne i sidan hinner inte sätta statuskoden när svaret redan
  // börjat strömma – besökaren får rätt innehåll men HTTP 200, alltså en mjuk
  // 404. Slugarna finns i konfigurationen, så proxyn kan avgöra saken innan
  // renderingen börjar och utan att fråga JobSearch.
  const occupationMatch = pathname.match(OCCUPATION_PATH);
  if (occupationMatch) {
    const [, occupationSlug, regionSlug] = occupationMatch;
    const unknown = !getOccupationCategory(occupationSlug) || (regionSlug != null && !getRegion(regionSlug));
    return unknown ? notFound(request) : NextResponse.next();
  }

  const regionMatch = pathname.match(REGION_PATH);
  if (regionMatch) {
    return getRegion(regionMatch[1]) ? NextResponse.next() : notFound(request);
  }

  const jobMatch = pathname.match(JOB_PATH);
  if (!jobMatch) return NextResponse.next();

  const [, id, requestedSlug] = jobMatch;

  try {
    const canonicalSlug = await getCanonicalJobSlug(id);
    if (!canonicalSlug) return notFound(request);
    if (requestedSlug === canonicalSlug) return NextResponse.next();

    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.pathname = `/lediga-jobb/${id}/${canonicalSlug}`;
    canonicalUrl.search = "";
    return NextResponse.redirect(canonicalUrl, 308);
  } catch {
    // Låt sidan hantera det tillfälliga API-felet med sitt ordinarie feltillstånd.
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/lediga-jobb/:id/:slug",
    "/lediga-jobb/yrke/:yrkesroll/:region",
  ],
};
