"use client";

import { track } from "@vercel/analytics";
import Link from "next/link";
import type { ReactNode } from "react";

export type JobCardAnalyticsContext = {
  source:
    | "home_latest"
    | "search_results"
    | "occupation_landing"
    | "region_landing"
    | "occupation_region_landing"
    | "remote_landing"
    | "related_jobs";
  occupation?: string;
  region?: string;
  sort?: "relevans" | "senaste" | "deadline";
};

export function TrackedJobLink({
  analyticsContext,
  ariaLabel,
  children,
  className,
  href,
  linkLocation,
  position,
}: {
  analyticsContext: JobCardAnalyticsContext;
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  href: string;
  linkLocation: "title" | "card_cta";
  position: number;
}) {
  return (
    <Link
      aria-label={ariaLabel}
      className={className}
      href={href}
      onClick={() => track("job_card_click", {
        source: analyticsContext.source,
        position,
        link_location: linkLocation,
        occupation: analyticsContext.occupation ?? "alla",
        region: analyticsContext.region ?? "hela_sverige",
        sort: analyticsContext.sort ?? "senaste",
      })}
    >
      {children}
    </Link>
  );
}
