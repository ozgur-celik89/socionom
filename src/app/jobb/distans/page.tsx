import type { Metadata } from "next";
import { JobLanding } from "@/components/JobLanding";
import { hasSearchParams, parsePage, type RawSearchParams } from "@/lib/search-params";

export async function generateMetadata({ searchParams }: { searchParams: Promise<RawSearchParams> }): Promise<Metadata> {
  const query = await searchParams;

  return {
    title: "Socionomjobb på distans",
    description: "Hitta socionomjobb och tjänster inom socialt arbete där arbetsgivaren anger möjlighet till distansarbete.",
    alternates: { canonical: "/jobb/distans" },
    ...(hasSearchParams(query) ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function RemoteJobsPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const query = await searchParams;
  const breadcrumbs = [
    { label: "Start", href: "/" },
    { label: "Lediga jobb", href: "/jobb" },
    { label: "Distansjobb" },
  ];

  return (
    <JobLanding
      basePath="/jobb/distans"
      breadcrumbs={breadcrumbs}
      description="Här samlar vi jobb där annonsen anger möjlighet att arbeta helt eller delvis på distans. Kontrollera alltid villkoren i den fullständiga annonsen."
      page={parsePage(query.sida)}
      remote
      title="Socionomjobb på distans"
    />
  );
}
