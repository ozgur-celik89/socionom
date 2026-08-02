import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobLanding } from "@/components/JobLanding";
import { getOccupationCategory } from "@/config/jobs";
import { getRegion } from "@/config/regions";
import { parsePage, type RawSearchParams } from "@/lib/search-params";

type Props = {
  params: Promise<{ yrkesroll: string; region: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ yrkesroll, region: regionSlug }] = await Promise.all([params, searchParams]);
  const occupation = getOccupationCategory(yrkesroll);
  const region = getRegion(regionSlug);
  if (!occupation || !region) return {};

  return {
    title: `${occupation.shortLabel}-jobb i ${region.shortLabel}`,
    description: `Hitta lediga jobb som ${occupation.shortLabel} i ${region.label}. Aktuella annonser samlade på socionom.se.`,
    alternates: { canonical: `/jobb/yrke/${occupation.slug}/${region.slug}` },
    robots: { index: false, follow: true },
  };
}

export default async function OccupationRegionPage({ params, searchParams }: Props) {
  const [{ yrkesroll, region: regionSlug }, query] = await Promise.all([params, searchParams]);
  const occupation = getOccupationCategory(yrkesroll);
  const region = getRegion(regionSlug);
  if (!occupation || !region) notFound();

  const basePath = `/jobb/yrke/${occupation.slug}/${region.slug}`;
  const breadcrumbs = [
    { label: "Start", href: "/" },
    { label: "Lediga jobb", href: "/jobb" },
    { label: occupation.shortLabel, href: `/jobb/yrke/${occupation.slug}` },
    { label: region.shortLabel },
  ];

  return (
    <JobLanding
      basePath={basePath}
      breadcrumbs={breadcrumbs}
      description={`Se aktuella tjänster som ${occupation.shortLabel} i ${region.label}. Jobben hämtas från Arbetsförmedlingen och uppdateras löpande.`}
      emptyAsNotFound
      occupation={occupation}
      page={parsePage(query.sida)}
      region={region}
      title={`${occupation.shortLabel}-jobb i ${region.shortLabel}`}
    />
  );
}
