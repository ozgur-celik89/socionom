import { describe, expect, it } from "vitest";
import type { Job } from "@/domain/jobs/types";
import { jobPostingJsonLd } from "./seo";

function createJob(overrides: Partial<Job> = {}): Job {
  return {
    id: "123",
    source: "arbetsformedlingen",
    slug: "kurator",
    title: "Kurator",
    descriptionHtml: "<p>Ett viktigt arbete.</p>",
    descriptionText: "Ett viktigt arbete.",
    employerName: "Exempelkommunen",
    locations: [{ municipality: "Uppsala", region: "Uppsala län", country: "Sverige", countryCode: "SE" }],
    occupationConceptIds: ["dJXy_Rpq_a2u"],
    workingHours: "Heltid",
    remote: true,
    publishedAt: "2099-01-01T10:00:00",
    expiresAt: "2099-02-01",
    applyUrl: "https://example.se/ansok",
    sourceUrl: "https://arbetsformedlingen.se/platsbanken/annonser/123",
    ...overrides,
  };
}

describe("JobPosting structured data", () => {
  it("uses Google-supported employment values and the visible HTML description", () => {
    const data = jobPostingJsonLd(createJob());

    expect(data.employmentType).toBe("FULL_TIME");
    expect(data.description).toBe("<p>Ett viktigt arbete.</p>");
    expect(data).not.toHaveProperty("jobLocationType");
    expect(data).not.toHaveProperty("applicantLocationRequirements");
  });

  it("omits employmentType when JobTech has no supported scope label", () => {
    const data = jobPostingJsonLd(createJob({ workingHours: "Varierande arbetstid" }));
    expect(data).not.toHaveProperty("employmentType");
  });
});
