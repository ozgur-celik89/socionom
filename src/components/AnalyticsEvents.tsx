"use client";

import { track } from "@vercel/analytics";
import Link from "next/link";
import { useEffect, type ReactNode } from "react";

export function ZeroResultsTracker() {
  useEffect(() => {
    track("zero_results");
  }, []);

  return null;
}

export function TrackedLink({
  href,
  eventName,
  className,
  children,
}: {
  href: string;
  eventName: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link className={className} href={href} onClick={() => track(eventName)}>
      {children}
    </Link>
  );
}

