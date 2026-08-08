import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EmployerCallout, ApiErrorState, JobResultsSkeleton } from "@/components/States";
import { JobResults } from "@/components/JobResults";
import { JsonLd } from "@/components/JsonLd";
import { SearchForm } from "@/components/SearchForm";
import { searchJobs } from "@/integrations/jobtech/search";
import { hasSearchParams, parseJobSearchParams, toPaginationParams, type RawSearchParams } from "@/lib/search-params";
import { breadcrumbJsonLd } from "@/lib/seo";

type ParsedFilters = ReturnType<typeof parseJobSearchParams>;

async function SearchResults({
  filters,
  paginationParams,
}: {
  filters: ParsedFilters;
  paginationParams: URLSearchParams;
}) {
  let result;

  try {
    result = await searchJobs({
      query: filters.query ?? filters.occupation?.query,
      occupationGroupIds: filters.occupation?.groupIds,
      occupationNameIds: filters.occupation?.occupationNameIds,
      regionId: filters.region?.conceptId,
      worktimeExtentId: filters.workingHours?.conceptId,
      remote: filters.remote,
      sort: filters.sort,
      page: filters.page,
    });
  } catch {
    result = null;
  }

  const analyticsSort = filters.sort === "relevance"
    ? "relevans" as const
    : filters.sort === "applydate-asc"
      ? "deadline" as const
      : "senaste" as const;

  return result ? (
    <JobResults
      analyticsContext={{
        source: "search_results",
        occupation: filters.occupation?.slug,
        region: filters.region?.slug,
        sort: analyticsSort,
      }}
      basePath="/lediga-jobb"
      headingContext={{
        query: filters.query,
        occupationLabel: filters.occupation?.shortLabel,
        regionLabel: filters.region?.shortLabel,
        remote: filters.remote,
      }}
      paginationParams={paginationParams}
      result={result}
    />
  ) : <ApiErrorState />;
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<RawSearchParams> }): Promise<Metadata> {
  const rawParams = await searchParams;
  const hasFilters = hasSearchParams(rawParams);

  return {
    title: "Lediga socionomjobb i Sverige",
    description: "Sök bland aktuella jobb för socionomer i hela Sverige. Filtrera på yrkesområde, region, omfattning och distansarbete.",
    alternates: { canonical: "/lediga-jobb" },
    ...(hasFilters ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function JobsPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const rawParams = await searchParams;
  const filters = parseJobSearchParams(rawParams);
  const breadcrumbs = [{ label: "Start", href: "/" }, { label: "Lediga jobb" }];
  const paginationParams = toPaginationParams(rawParams);
  const resultsKey = [paginationParams.toString(), filters.page].join(":");

  return (
    <>
      <section className="page-hero">
        <div className="site-container">
          <Breadcrumbs items={breadcrumbs} />
          <h1>Lediga jobb för socionomer</h1>
          <p>Sök bland aktuella tjänster inom socialt arbete i hela Sverige.</p>
        </div>
      </section>
      <section className="section-compact">
        <div className="site-container">
          <SearchForm values={{
            q: filters.query,
            yrke: filters.occupation?.slug,
            region: filters.region?.slug,
            anstallning: filters.workingHours?.slug,
            distans: filters.remote,
            sort: filters.sortValue,
          }} />
          <Suspense fallback={<JobResultsSkeleton />} key={resultsKey}>
            <SearchResults filters={filters} paginationParams={paginationParams} />
          </Suspense>
          <EmployerCallout />
        </div>
      </section>
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
    </>
  );
}
