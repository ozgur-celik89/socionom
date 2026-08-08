import type { Metadata } from "next";
import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { ApplyButton } from "@/components/ApplyButton";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { JobList } from "@/components/JobList";
import { ReportJobLink } from "@/components/ReportJobLink";
import { BriefcaseIcon, CalendarIcon, ClockIcon, MapPinIcon } from "@/components/icons";
import { getBestOccupationCategory } from "@/config/jobs";
import { getRegionByConceptId } from "@/config/regions";
import type { JobSummary } from "@/domain/jobs/types";
import { getJobById, searchJobs } from "@/integrations/jobtech/search";
import { formatDate, formatScope } from "@/lib/format";
import { breadcrumbJsonLd, jobPostingJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ id: string; slug: string }> };
const getRequestJobById = cache(getJobById);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = await getRequestJobById(id);
  if (!job) return { title: "Jobbet finns inte", robots: { index: false, follow: true } };

  const location = job.locations[0]?.municipality ?? job.locations[0]?.region ?? "Sverige";
  const description = `${job.title} hos ${job.employerName} i ${location}. Läs annonsen och ansök till tjänsten.`;

  return {
    title: `${job.title} hos ${job.employerName}`,
    description,
    alternates: { canonical: `/lediga-jobb/${job.id}/${job.slug}` },
    openGraph: {
      type: "article",
      title: job.title,
      description,
      url: `/lediga-jobb/${job.id}/${job.slug}`,
      publishedTime: job.publishedAt,
      modifiedTime: job.sourceUpdatedAt,
    },
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { id, slug } = await params;
  const job = await getRequestJobById(id);
  if (!job) notFound();
  if (slug !== job.slug) permanentRedirect(`/lediga-jobb/${job.id}/${job.slug}`);

  const location = job.locations[0];
  const occupation = getBestOccupationCategory(job.title, job.occupationConceptIds);
  const region = getRegionByConceptId(location?.regionConceptId);
  const locationLabel = location?.municipality ?? location?.region ?? "Sverige";
  const postalLocality = [location?.postcode, location?.city ?? location?.municipality]
    .filter(Boolean)
    .join(" ");
  const workplaceAddress = location?.streetAddress || location?.postcode || location?.city
    ? [location.streetAddress, postalLocality].filter(Boolean).join(", ")
    : locationLabel;
  const scope = formatScope(job.scopeMin, job.scopeMax);
  let relatedJobs: JobSummary[] = [];

  try {
    const relatedResult = await searchJobs({
      query: occupation?.query,
      occupationGroupIds: occupation?.groupIds,
      occupationNameIds: occupation?.occupationNameIds,
      regionId: region?.conceptId,
      pageSize: 4,
      sort: "pubdate-desc",
    });
    relatedJobs = relatedResult.jobs.filter((item) => item.id !== job.id).slice(0, 3);
  } catch {
    relatedJobs = [];
  }

  const breadcrumbs = [
    { label: "Start", href: "/" },
    { label: "Lediga jobb", href: "/lediga-jobb" },
    ...(occupation ? [{ label: occupation.shortLabel, href: `/lediga-jobb/yrke/${occupation.slug}` }] : []),
    ...(region ? [{ label: region.shortLabel, href: `/lediga-jobb/ort/${region.slug}` }] : []),
    { label: job.title },
  ];

  return (
    <>
      <section className="job-detail-wrap">
        <div className="site-container">
          <Breadcrumbs items={breadcrumbs} />
          <div className="job-detail-grid">
            <article className="job-detail">
              <header className="job-detail-header">
                <h1>{job.title}</h1>
                <p className="job-detail-employer">{job.employerName}</p>
                <ul className="job-meta" aria-label="Sammanfattning av jobbet">
                  <li><MapPinIcon />{locationLabel}{job.remote ? " · Distans möjlig" : ""}</li>
                  {job.workingHours && <li><ClockIcon />{job.workingHours}</li>}
                  {job.employmentType && <li><BriefcaseIcon />{job.employmentType}</li>}
                </ul>
                <div className="job-mobile-apply">
                  <ApplyButton href={job.applyUrl} jobId={job.id} />
                  <p className="apply-note">Ansökan öppnas hos arbetsgivaren eller, om direktlänk saknas, hos Arbetsförmedlingen.</p>
                  <ReportJobLink jobId={job.id} jobSlug={job.slug} jobTitle={job.title} />
                </div>
              </header>
              <div className="job-detail-body">
                <h2>Om jobbet</h2>
                <div className="job-description" dangerouslySetInnerHTML={{ __html: job.descriptionHtml }} />
              </div>
            </article>

            <aside className="job-sidebar" aria-label="Fakta och ansökan">
              <div className="job-sidebar-card job-sidebar-apply">
                <ApplyButton href={job.applyUrl} jobId={job.id} />
                <p className="apply-note">Ansökan öppnas hos arbetsgivaren eller, om direktlänk saknas, hos Arbetsförmedlingen.</p>
                <ReportJobLink jobId={job.id} jobSlug={job.slug} jobTitle={job.title} />
              </div>
              <div className="job-sidebar-card">
                <h2>Om tjänsten</h2>
                <ul className="detail-list">
                  <li><MapPinIcon /><span><strong>Plats</strong>{workplaceAddress}</span></li>
                  {job.expiresAt && <li><CalendarIcon /><span><strong>Sista ansökningsdag</strong>{formatDate(job.expiresAt)}</span></li>}
                  <li><CalendarIcon /><span><strong>Publicerad</strong>{formatDate(job.publishedAt)}</span></li>
                  {(job.workingHours || scope) && <li><ClockIcon /><span><strong>Omfattning</strong>{[job.workingHours, scope].filter(Boolean).join(" · ")}</span></li>}
                  {(job.duration || job.employmentType) && <li><BriefcaseIcon /><span><strong>Anställning</strong>{[job.employmentType, job.duration].filter(Boolean).join(" · ")}</span></li>}
                  {job.vacancies && <li><BriefcaseIcon /><span><strong>Antal tjänster</strong>{job.vacancies}</span></li>}
                </ul>
              </div>
            </aside>
          </div>
          {relatedJobs.length > 0 && (
            <section aria-labelledby="related-jobs-title" className="related-jobs">
              <div className="section-header">
                <div>
                  <h2 id="related-jobs-title">Liknande jobb</h2>
                </div>
              </div>
              <JobList
                analyticsContext={{
                  source: "related_jobs",
                  occupation: occupation?.slug,
                  region: region?.slug,
                  sort: "senaste",
                }}
                jobs={relatedJobs}
              />
            </section>
          )}
        </div>
      </section>
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <JsonLd data={jobPostingJsonLd(job)} />
    </>
  );
}
