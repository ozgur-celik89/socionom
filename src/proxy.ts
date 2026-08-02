import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCanonicalJobSlug } from "@/integrations/jobtech/search";

export async function proxy(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") return NextResponse.next();

  const pathMatch = request.nextUrl.pathname.match(/^\/jobb\/(\d{1,64})\/([^/]+)$/);
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
    canonicalUrl.pathname = `/jobb/${id}/${canonicalSlug}`;
    canonicalUrl.search = "";
    return NextResponse.redirect(canonicalUrl, 308);
  } catch {
    // Låt sidan hantera det tillfälliga API-felet med sitt ordinarie feltillstånd.
    return NextResponse.next();
  }
}

export const config = {
  matcher: "/jobb/:id/:slug",
};
