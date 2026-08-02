import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobLanding } from "@/components/JobLanding";
import { getOccupationCategory } from "@/config/jobs";
import { hasSearchParams, parsePage, type RawSearchParams } from "@/lib/search-params";

type Props = {
  params: Promise<{ yrkesroll: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ yrkesroll }, query] = await Promise.all([params, searchParams]);
  const occupation = getOccupationCategory(yrkesroll);
  if (!occupation) return {};

  return {
    title: `Lediga jobb som ${occupation.shortLabel}`,
    description: `${occupation.description} Se aktuella annonser och sök nästa jobb på socionom.se.`,
    alternates: { canonical: `/lediga-jobb/yrke/${occupation.slug}` },
    ...(hasSearchParams(query) ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function OccupationPage({ params, searchParams }: Props) {
  const [{ yrkesroll }, query] = await Promise.all([params, searchParams]);
  const occupation = getOccupationCategory(yrkesroll);
  if (!occupation) notFound();

  const basePath = `/lediga-jobb/yrke/${occupation.slug}`;
  const breadcrumbs = [
    { label: "Start", href: "/" },
    { label: "Lediga jobb", href: "/lediga-jobb" },
    { label: occupation.shortLabel },
  ];

  return (
    <JobLanding
      basePath={basePath}
      breadcrumbs={breadcrumbs}
      description={occupation.description}
      occupation={occupation}
      page={parsePage(query.sida)}
      title={`Lediga jobb som ${occupation.shortLabel}`}
    />
  );
}
