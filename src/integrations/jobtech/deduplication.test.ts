import { describe, expect, it } from "vitest";
import type { JobtechAd } from "./types";
import { deduplicateJobtechAds, getJobtechDeduplicationKey } from "./deduplication";

function ad(overrides: Partial<JobtechAd> = {}): JobtechAd {
  return {
    id: "100",
    headline: "Socialsekreterare till vuxenenheten",
    application_deadline: "2099-02-01T23:59:59",
    description: { text: "Ett viktigt arbete." },
    employer: { name: "Exempelkommunen" },
    application_details: { url: "https://jobs.example.se/apply?id=42" },
    workplace_address: { municipality: "Göteborg", country: "Sverige" },
    ...overrides,
  };
}

describe("JobSearch deduplication", () => {
  it("groups different source IDs for the same application and keeps a deterministic ID", () => {
    const duplicateWithTracking = ad({
      id: "99",
      application_details: { url: "https://jobs.example.se/apply?utm_source=af&id=42" },
    });
    const duplicateWithoutTracking = ad({ id: "101" });

    expect(getJobtechDeduplicationKey(duplicateWithTracking))
      .toBe(getJobtechDeduplicationKey(duplicateWithoutTracking));
    expect(deduplicateJobtechAds([duplicateWithTracking, duplicateWithoutTracking]).map((item) => item.id))
      .toEqual(["101"]);
  });

  it("keeps ads with different application destinations", () => {
    const ads = deduplicateJobtechAds([
      ad({ id: "100" }),
      ad({ id: "101", application_details: { url: "https://jobs.example.se/apply?id=43" } }),
    ]);

    expect(ads.map((item) => item.id)).toEqual(["100", "101"]);
  });

  it("requires matching content and location when a direct application URL is missing", () => {
    const ads = deduplicateJobtechAds([
      ad({ id: "100", application_details: null }),
      ad({ id: "101", application_details: null }),
      ad({
        id: "102",
        application_details: null,
        workplace_address: { municipality: "Malmö", country: "Sverige" },
      }),
    ]);

    expect(ads.map((item) => item.id)).toEqual(["101", "102"]);
  });
});
