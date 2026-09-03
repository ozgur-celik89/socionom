"use client";

import { track } from "@vercel/analytics";
import { ExternalLinkIcon } from "./icons";

/**
 * Annonsen länkar till arbetsgivaren när den har en direktlänk, annars till
 * Arbetsförmedlingen. Skillnaden är hela poängen med att mäta klicket.
 */
function applyDestination(href: string) {
  try {
    const { hostname } = new URL(href);
    return hostname === "arbetsformedlingen.se" || hostname.endsWith(".arbetsformedlingen.se")
      ? "arbetsformedlingen"
      : "arbetsgivare";
  } catch {
    return "okand";
  }
}

export function ApplyButton({ href, jobId }: { href: string; jobId: string }) {
  return (
    <a
      className="button button-primary apply-button"
      href={href}
      onClick={() => track("job_apply_click", { source: applyDestination(href), job: jobId })}
      rel="noopener noreferrer"
      target="_blank"
    >
      Ansök till jobbet
      <ExternalLinkIcon />
    </a>
  );
}
