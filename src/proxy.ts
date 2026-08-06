import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCanonicalJobSlug } from "@/integrations/jobtech/canonical";

function isClientRouterRequest(request: NextRequest) {
  return request.headers.get("rsc") === "1"
    || request.headers.get("next-router-prefetch") === "1"
    || request.headers.has("next-router-segment-prefetch")
    || request.headers.get("purpose")?.toLowerCase() === "prefetch"
    || request.headers.get("sec-purpose")?.toLowerCase().includes("prefetch");
}

export async function proxy(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") return NextResponse.next();
  // Klientnavigering valideras redan av jobbsidan. Proxy behövs bara för att
  // direkta dokumentförfrågningar ska få en riktig HTTP 308 eller 404.
  if (isClientRouterRequest(request)) return NextResponse.next();

  const pathMatch = request.nextUrl.pathname.match(/^\/lediga-jobb\/(\d{1,64})\/([^/]+)$/);
  if (!pathMatch) return NextResponse.next();

  const [, id, requestedSlug] = pathMatch;

  try {
    const canonicalSlug = await getCanonicalJobSlug(id);
    if (!canonicalSlug) {
      const notFoundUrl = request.nextUrl.clone();
      notFoundUrl.pathname = "/_not-found";
      notFoundUrl.search = "";
      return NextResponse.rewrite(notFoundUrl, { status: 404 });
    }

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
  matcher: "/lediga-jobb/:id/:slug",
};
