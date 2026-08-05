import type { JobSummary } from "@/domain/jobs/types";
import { JobCard } from "./JobCard";
import type { JobCardAnalyticsContext } from "./TrackedJobLink";

export function JobList({
  analyticsContext,
  jobs,
}: {
  analyticsContext: JobCardAnalyticsContext;
  jobs: JobSummary[];
}) {
  return (
    <div className="job-list">
      {jobs.map((job, index) => (
        <JobCard
          analyticsContext={analyticsContext}
          job={job}
          key={job.id}
          position={index + 1}
        />
      ))}
    </div>
  );
}
