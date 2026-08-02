import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobLanding } from "@/components/JobLanding";
import { getRegion } from "@/config/regions";
import { hasSearchParams, parsePage, type RawSearchParams } from "@/lib/search-params";

type Props = {
  params: Promise<{ region: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ region: regionSlug }, query] = await Promise.all([params, searchParams]);
  const region = getRegion(regionSlug);
  if (!region) return {};

  return {
    title: `Lediga socionomjobb i ${region.shortLabel}`,
    description: `Hitta aktuella jobb för socionomer i ${region.label}. Sök tjänster inom socialt arbete på socionom.se.`,
    alternates: { canonical: `/jobb/ort/${region.slug}` },
    ...(hasSearchParams(query) ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function RegionPage({ params, searchParams }: Props) {
  const [{ region: regionSlug }, query] = await Promise.all([params, searchParams]);
  const region = getRegion(regionSlug);
  if (!region) notFound();

  const basePath = `/jobb/ort/${region.slug}`;
  const breadcrumbs = [
    { label: "Start", href: "/" },
    { label: "Lediga jobb", href: "/jobb" },
    { label: region.shortLabel },
  ];

  return (
    <JobLanding
      basePath={basePath}
      breadcrumbs={breadcrumbs}
      description={`Hitta aktuella socionomjobb och tjänster inom socialt arbete i ${region.label}. Listan uppdateras löpande med annonser från Arbetsförmedlingen.`}
      page={parsePage(query.sida)}
      region={region}
      title={`Lediga socionomjobb i ${region.shortLabel}`}
    />
  );
}
