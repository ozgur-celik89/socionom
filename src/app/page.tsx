import Link from "next/link";
import { JobList } from "@/components/JobList";
import { SearchForm } from "@/components/SearchForm";
import { ApiErrorState, EmployerCallout } from "@/components/States";
import { ArrowRightIcon } from "@/components/icons";
import { priorityRegions } from "@/config/regions";
import { occupationCategories } from "@/config/jobs";
import { searchJobs } from "@/integrations/jobtech/search";
import { formatApproximateNumber } from "@/lib/format";

export const revalidate = 600;

export default async function HomePage() {
  let searchResult = null;

  try {
    searchResult = await searchJobs({ pageSize: 6, sort: "pubdate-desc" });
  } catch {
    searchResult = null;
  }

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
            {searchResult ? (
              <span className="hero-job-count">
                <strong>Cirka {formatApproximateNumber(searchResult.total)}</strong> aktuella annonser
              </span>
            ) : null}
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
          {searchResult ? (
            <JobList
              analyticsContext={{ source: "home_latest", sort: "senaste" }}
              jobs={searchResult.jobs}
            />
          ) : <ApiErrorState />}
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
