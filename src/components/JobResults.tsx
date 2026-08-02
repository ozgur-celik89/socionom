import type { JobSearchResult } from "@/domain/jobs/types";
import { JobList } from "./JobList";
import { Pagination } from "./Pagination";
import { EmptyJobsState } from "./States";

export function JobResults({
  result,
  basePath,
  paginationParams,
}: {
  result: JobSearchResult;
  basePath: string;
  paginationParams?: URLSearchParams;
}) {
  return (
    <>
      <div className="results-heading">
        <h2>Lediga jobb</h2>
        <p>{result.total.toLocaleString("sv-SE")} träffar</p>
      </div>
      {result.jobs.length > 0 ? (
        <>
          <JobList jobs={result.jobs} />
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
