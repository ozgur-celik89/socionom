import Link from "next/link";
import { cache, Suspense } from "react";
import { JobList } from "@/components/JobList";
import { SearchForm } from "@/components/SearchForm";
import { ApiErrorState, EmployerCallout, JobListSkeleton } from "@/components/States";
import { ArrowRightIcon } from "@/components/icons";
import { priorityRegions } from "@/config/regions";
import { occupationCategories } from "@/config/jobs";
import { searchJobs } from "@/integrations/jobtech/search";
import { formatNumber } from "@/lib/format";

export const revalidate = 600;

const getHomeSearchResult = cache(async () => {
  try {
    return await searchJobs({ pageSize: 6, sort: "pubdate-desc" });
  } catch {
    return null;
  }
});

function HeroJobCountPlaceholder() {
  return (
    <span aria-hidden="true" className="hero-job-count hero-job-count-placeholder">
      000 aktuella annonser
    </span>
  );
}

async function HeroJobCount() {
  const searchResult = await getHomeSearchResult();

  if (!searchResult) return <HeroJobCountPlaceholder />;

  return (
    <span className="hero-job-count">
      <strong>{formatNumber(searchResult.total)}</strong> aktuella annonser
    </span>
  );
}

async function LatestJobs() {
  const searchResult = await getHomeSearchResult();

  if (!searchResult) return <ApiErrorState />;

  return (
    <JobList
      analyticsContext={{ source: "home_latest", sort: "senaste" }}
      jobs={searchResult.jobs}
    />
  );
}

function LatestJobsFallback() {
  return (
    <div aria-busy="true" aria-label="Hämtar aktuella jobb" className="home-job-list-loading">
      <JobListSkeleton count={6} />
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="site-container hero-content">
          <div className="hero-copy">
            <h1>Hitta nästa jobb som socionom</h1>
            <p>Aktuella och relevanta socionomjobb från hela Sverige – samlade på ett ställe.</p>
          </div>
          <SearchForm variant="hero" />
          <div className="trust-line" aria-label="Om tjänsten">
            <Suspense fallback={<HeroJobCountPlaceholder />}>
              <HeroJobCount />
            </Suspense>
            <span className="hero-job-note">Bara jobb inom socialt arbete</span>
          </div>
          <nav aria-label="Sök jobb efter yrkesområde" className="occupation-navigation" id="yrkesomraden">
            <strong>Yrkesområden</strong>
            <div>
              {occupationCategories.map((occupation) => (
                <Link href={`/lediga-jobb/yrke/${occupation.slug}`} key={occupation.slug}>
                  {occupation.shortLabel}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </section>

      <section className="section section-white">
        <div className="site-container">
          <div className="section-header">
            <div>
              <h2>Senaste socionomjobben</h2>
              <p>Ett urval av de senast publicerade socionomjobben.</p>
            </div>
            <Link className="text-link" href="/lediga-jobb">Visa alla jobb <ArrowRightIcon /></Link>
          </div>
          <Suspense fallback={<LatestJobsFallback />}>
            <LatestJobs />
          </Suspense>
        </div>
      </section>

      <section className="section">
        <div className="site-container">
          <div className="section-header">
            <div>
              <h2>Sök efter region</h2>
            </div>
            <Link className="text-link" href="/lediga-jobb">Sök i hela Sverige <ArrowRightIcon /></Link>
          </div>
          <div className="region-grid">
            {priorityRegions.map((region) => (
              <Link className="region-link" href={`/lediga-jobb/ort/${region.slug}`} key={region.slug}>
                {region.shortLabel} <ArrowRightIcon />
              </Link>
            ))}
          </div>
          <EmployerCallout />
        </div>
      </section>
    </>
  );
}
