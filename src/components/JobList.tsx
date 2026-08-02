import type { Job } from "@/domain/jobs/types";
import { JobCard } from "./JobCard";

export function JobList({ jobs }: { jobs: Job[] }) {
  return (
    <div className="job-list">
      {jobs.map((job) => <JobCard job={job} key={job.id} />)}
    </div>
  );
}
