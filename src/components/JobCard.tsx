import Link from "next/link";
import type { Job } from "@/domain/jobs/types";
import { formatDate, formatPublishedDate, formatScope, isRecentlyPublished } from "@/lib/format";
import { ArrowRightIcon, BriefcaseIcon, CalendarIcon, ClockIcon, MapPinIcon } from "./icons";

export function JobCard({ job }: { job: Job }) {
  const location = job.locations[0];
  const locationLabel = job.remote
    ? `${location?.municipality ?? location?.region ?? "Sverige"} · Distans möjlig`
    : location?.municipality ?? location?.region ?? "Sverige";
  const scope = formatScope(job.scopeMin, job.scopeMax);
  const jobHref = `/lediga-jobb/${job.id}/${job.slug}`;

  return (
    <article className="job-card">
      <div className="job-card-topline">
        {isRecentlyPublished(job.publishedAt) ? <span className="badge badge-new">Nytt</span> : <span />}
        <span className="source-label">Arbetsförmedlingen</span>
      </div>

      <div>
        <h2><Link href={jobHref}>{job.title}</Link></h2>
        <p className="job-employer">{job.employerName}</p>
      </div>

      <ul className="job-meta" aria-label="Jobbinformation">
        <li><MapPinIcon />{locationLabel}</li>
        {(job.workingHours || scope) && <li><ClockIcon />{job.workingHours ?? scope}</li>}
        {(job.duration || job.employmentType) && <li><BriefcaseIcon />{job.duration ?? job.employmentType}</li>}
      </ul>

      <div className="job-card-footer">
        <div className="job-card-dates">
          <span>{formatPublishedDate(job.publishedAt)}</span>
          {job.expiresAt && <span><CalendarIcon /> Ansök senast {formatDate(job.expiresAt)}</span>}
        </div>
        <Link aria-label={`Visa jobbet ${job.title}`} className="job-card-link" href={jobHref}>
          Visa jobbet <ArrowRightIcon />
        </Link>
      </div>
    </article>
  );
}
