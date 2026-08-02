"use client";

import { track } from "@vercel/analytics";
import { ExternalLinkIcon } from "./icons";

export function ApplyButton({ href, jobId }: { href: string; jobId: string }) {
  return (
    <a
      className="button button-primary apply-button"
      href={href}
      onClick={() => track("job_apply_click", { source: "arbetsformedlingen", job: jobId })}
      rel="noopener noreferrer"
      target="_blank"
    >
      Ansök till jobbet
      <ExternalLinkIcon />
    </a>
  );
}
