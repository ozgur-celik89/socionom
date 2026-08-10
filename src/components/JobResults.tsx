import Link from "next/link";
import type { JobSearchResult } from "@/domain/jobs/types";
import { formatNumber } from "@/lib/format";
import { JobList } from "./JobList";
import { Pagination } from "./Pagination";
import { EmptyJobsState } from "./States";
import type { JobCardAnalyticsContext } from "./TrackedJobLink";

export type JobResultsHeadingContext = {
  query?: string;
  occupationLabel?: string;
  regionLabel?: string;
  remote?: boolean;
};

function roleInSentence(label: string) {
  if (/^[A-ZÅÄÖ]{2,}(?:-|$)/.test(label)) return label;
  return `${label.charAt(0).toLocaleLowerCase("sv-SE")}${label.slice(1)}`;
}

export function getJobResultsHeading(total: number, context: JobResultsHeadingContext = {}) {
  const count = total.toLocaleString("sv-SE");
  const region = context.regionLabel ? ` i ${context.regionLabel}` : "";

  if (context.query) return `${count} jobb för ”${context.query}”${region}`;

  if (context.occupationLabel) {
    const jobs = total === 1 ? "ledigt jobb" : "lediga jobb";
    return `${count} ${jobs} som ${roleInSentence(context.occupationLabel)}${region}`;
  }

  if (context.regionLabel) {
    const jobs = total === 1 ? "ledigt socionomjobb" : "lediga socionomjobb";
    return `${count} ${jobs}${region}`;
  }

  if (context.remote) return `${count} socionomjobb med möjlighet till distans`;

  const jobs = total === 1 ? "ledigt socionomjobb" : "lediga socionomjobb";
  return `${count} ${jobs}`;
}

export function JobResults({
  result,
  basePath,
  paginationParams,
  headingContext,
  analyticsContext,
}: {
  result: JobSearchResult;
  basePath: string;
  paginationParams?: URLSearchParams;
  headingContext?: JobResultsHeadingContext;
  analyticsContext: JobCardAnalyticsContext;
}) {
  return (
    <>
      <div className="results-heading">
        <h2>{getJobResultsHeading(result.total, headingContext)}</h2>
        {result.filteredOut ? (
          <p className="results-curation">
            {formatNumber(result.filteredOut)} annonser i samma sökning valdes bort –
            familjehemsuppdrag, dubbletter och utgångna annonser.{" "}
            <Link href="/sa-valjer-vi-jobb">Så väljer vi jobb</Link>
          </p>
        ) : null}
      </div>
      {result.jobs.length > 0 ? (
        <>
          <JobList analyticsContext={analyticsContext} jobs={result.jobs} />
          <Pagination
            basePath={basePath}
            currentPage={result.page}
            params={paginationParams}
            totalPages={result.totalPages}
          />
        </>
      ) : <EmptyJobsState />}
    </>
  );
}
