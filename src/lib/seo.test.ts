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
    locations: [{
      municipality: "Uppsala",
      region: "Uppsala län",
      city: "Uppsala",
      streetAddress: "Storgatan 1",
      postcode: "753 20",
      country: "Sverige",
      countryCode: "SE",
    }],
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
    expect(data.jobLocation.address).toMatchObject({
      streetAddress: "Storgatan 1",
      addressLocality: "Uppsala",
      postalCode: "753 20",
      addressCountry: "SE",
    });
    expect(data).not.toHaveProperty("jobLocationType");
    expect(data).not.toHaveProperty("applicantLocationRequirements");
  });

  it("omits streetAddress when the employer did not provide one", () => {
    const data = jobPostingJsonLd(createJob({
      locations: [{ municipality: "Uppsala", region: "Uppsala län", country: "Sverige", countryCode: "SE" }],
    }));

    expect(data.jobLocation.address).not.toHaveProperty("streetAddress");
  });

  it("omits postalCode when the employer did not provide one", () => {
    const data = jobPostingJsonLd(createJob({
      locations: [{ municipality: "Uppsala", region: "Uppsala län", country: "Sverige", countryCode: "SE" }],
    }));

    expect(data.jobLocation.address).not.toHaveProperty("postalCode");
  });

  it("maps a JobTech temporary employment type when working hours are missing", () => {
    const data = jobPostingJsonLd(createJob({
      workingHours: undefined,
      employmentType: "Vikariat",
      employmentTypeConceptId: "gro4_cWF_6D7",
    }));

    expect(data.employmentType).toBe("TEMPORARY");
  });

  it("uses Google's OTHER value for permanent employment when working hours are missing", () => {
    const data = jobPostingJsonLd(createJob({
      workingHours: undefined,
      employmentType: "Tillsvidareanställning (inkl. eventuell provanställning)",
      employmentTypeConceptId: "kpPX_CNN_gDU",
    }));

    expect(data.employmentType).toBe("OTHER");
  });

  it("omits employmentType when JobTech has no supported scope label", () => {
    const data = jobPostingJsonLd(createJob({ workingHours: "Varierande arbetstid" }));
    expect(data).not.toHaveProperty("employmentType");
  });
});
