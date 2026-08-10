import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobLanding } from "@/components/JobLanding";
import { getOccupationCategory } from "@/config/jobs";
import { getRegion } from "@/config/regions";
import { isIndexableLanding } from "@/lib/landing";
import { hasSearchParams, parsePage, type RawSearchParams } from "@/lib/search-params";

type Props = {
  params: Promise<{ yrkesroll: string; region: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ yrkesroll, region: regionSlug }, query] = await Promise.all([params, searchParams]);
  const occupation = getOccupationCategory(yrkesroll);
  const region = getRegion(regionSlug);
  if (!occupation || !region) return {};

  // Kombinationen indexeras bara när den har tillräckligt med annonser. Sidan
  // hämtar ändå träffarna, så kontrollen delar katalogens cache med dem.
  // Svarar JobSearch inte alls är noindex det säkra beskedet.
  const indexable = hasSearchParams(query)
    ? false
    : await isIndexableLanding({ occupation, region }).catch(() => false);

  return {
    title: `${occupation.shortLabel}-jobb i ${region.shortLabel}`,
    description: `Hitta lediga jobb som ${occupation.shortLabel} i ${region.label}. Aktuella annonser samlade på socionom.se.`,
    alternates: { canonical: `/lediga-jobb/yrke/${occupation.slug}/${region.slug}` },
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function OccupationRegionPage({ params, searchParams }: Props) {
  const [{ yrkesroll, region: regionSlug }, query] = await Promise.all([params, searchParams]);
  const occupation = getOccupationCategory(yrkesroll);
  const region = getRegion(regionSlug);
  if (!occupation || !region) notFound();

  const basePath = `/lediga-jobb/yrke/${occupation.slug}/${region.slug}`;
  const breadcrumbs = [
    { label: "Start", href: "/" },
    { label: "Lediga jobb", href: "/lediga-jobb" },
    { label: occupation.shortLabel, href: `/lediga-jobb/yrke/${occupation.slug}` },
    { label: region.shortLabel },
  ];

  return (
    <JobLanding
      basePath={basePath}
      breadcrumbs={breadcrumbs}
      description={`Se aktuella tjänster som ${occupation.shortLabel} i ${region.label}. Jobben hämtas från Arbetsförmedlingen och uppdateras löpande.`}
      occupation={occupation}
      page={parsePage(query.sida)}
      region={region}
      title={`${occupation.shortLabel}-jobb i ${region.shortLabel}`}
    />
  );
}
