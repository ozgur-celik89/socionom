import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { BreadcrumbItem } from "./Breadcrumbs";
import { occupationCategories, type OccupationCategory } from "@/config/jobs";
import { priorityRegions, type Region } from "@/config/regions";
import type { JobSearchResult } from "@/domain/jobs/types";
import { searchJobs } from "@/integrations/jobtech/search";
import { breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "./Breadcrumbs";
import { EmployerCallout, ApiErrorState, JobResultsSkeleton } from "./States";
import { JobResults } from "./JobResults";
import { JsonLd } from "./JsonLd";
import { SearchForm } from "./SearchForm";

type LandingSearch = {
  occupation?: OccupationCategory;
  region?: Region;
  remote: boolean;
  page: number;
};

async function loadLandingJobs({ occupation, region, remote, page }: LandingSearch) {
  try {
    return await searchJobs({
      query: occupation?.query,
      occupationGroupIds: occupation?.groupIds,
      regionId: region?.conceptId,
      remote,
      page,
      sort: "pubdate-desc",
    });
  } catch {
    return null;
  }
}

function LandingResults({ result, basePath }: { result: JobSearchResult | null; basePath: string }) {
  return result ? <JobResults basePath={basePath} result={result} /> : <ApiErrorState />;
}

async function DeferredLandingResults(props: LandingSearch & { basePath: string }) {
  const result = await loadLandingJobs(props);
  return <LandingResults basePath={props.basePath} result={result} />;
}

export async function JobLanding({
  title,
  description,
  basePath,
  page,
  occupation,
  region,
  remote = false,
  breadcrumbs,
  emptyAsNotFound = false,
}: {
  title: string;
  description: string;
  basePath: string;
  page: number;
  occupation?: OccupationCategory;
  region?: Region;
  remote?: boolean;
  breadcrumbs: BreadcrumbItem[];
  emptyAsNotFound?: boolean;
}) {
  const landingSearch = { occupation, region, remote, page };
  const verifiedResult = emptyAsNotFound ? await loadLandingJobs(landingSearch) : undefined;

  if (verifiedResult?.total === 0) notFound();

  const relatedLinks = occupation && !region
    ? priorityRegions.map((item) => ({
        href: `/lediga-jobb/yrke/${occupation.slug}/${item.slug}`,
        label: `${occupation.shortLabel} i ${item.shortLabel}`,
      }))
    : region
      ? occupationCategories.map((item) => ({
          href: `/lediga-jobb/yrke/${item.slug}/${region.slug}`,
          label: `${item.shortLabel} i ${region.shortLabel}`,
        }))
      : [];

  return (
    <>
      <section className="page-hero">
        <div className="site-container">
          <Breadcrumbs items={breadcrumbs} />
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </section>
      <section className="section-compact">
        <div className="site-container">
          <SearchForm
            values={{
              yrke: occupation?.slug,
              region: region?.slug,
              distans: remote,
              sort: "senaste",
            }}
          />
          {emptyAsNotFound ? (
            <LandingResults basePath={basePath} result={verifiedResult ?? null} />
          ) : (
            <Suspense fallback={<JobResultsSkeleton />} key={`${basePath}:${page}`}>
              <DeferredLandingResults {...landingSearch} basePath={basePath} />
            </Suspense>
          )}
          {relatedLinks.length > 0 && (
            <nav aria-labelledby="related-landing-title" className="landing-links">
              <h2 id="related-landing-title">
                {occupation && !region ? "Sök rollen efter region" : `Yrkesområden i ${region?.shortLabel}`}
              </h2>
              <div className="landing-link-list">
                {relatedLinks.map((item) => (
                  <Link href={item.href} key={item.href}>{item.label}</Link>
                ))}
              </div>
            </nav>
          )}
          <EmployerCallout />
        </div>
      </section>
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
    </>
  );
}
