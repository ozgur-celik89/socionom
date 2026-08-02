import Link from "next/link";
import { notFound } from "next/navigation";
import type { BreadcrumbItem } from "./Breadcrumbs";
import { occupationCategories, type OccupationCategory } from "@/config/jobs";
import { priorityRegions, type Region } from "@/config/regions";
import { searchJobs } from "@/integrations/jobtech/search";
import { breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "./Breadcrumbs";
import { EmployerCallout, ApiErrorState } from "./States";
import { JobResults } from "./JobResults";
import { JsonLd } from "./JsonLd";
import { SearchForm } from "./SearchForm";

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
  let result;

  try {
    result = await searchJobs({
      query: occupation?.query,
      occupationGroupIds: occupation?.groupIds,
      regionId: region?.conceptId,
      remote,
      page,
      sort: "pubdate-desc",
    });
  } catch {
    result = null;
  }

  if (emptyAsNotFound && result?.total === 0) notFound();

  const relatedLinks = occupation && !region
    ? priorityRegions.map((item) => ({
        href: `/jobb/yrke/${occupation.slug}/${item.slug}`,
        label: `${occupation.shortLabel} i ${item.shortLabel}`,
      }))
    : region
      ? occupationCategories.map((item) => ({
          href: `/jobb/yrke/${item.slug}/${region.slug}`,
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
          {result ? (
            <JobResults basePath={basePath} result={result} />
          ) : <ApiErrorState />}
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
