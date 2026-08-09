import { describe, expect, it } from "vitest";
import type { JobtechAd } from "./types";
import { deduplicateJobtechAds, getJobtechDeduplicationKeys } from "./deduplication";

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

    expect(getJobtechDeduplicationKeys(duplicateWithTracking))
      .toEqual(getJobtechDeduplicationKeys(duplicateWithoutTracking));
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

  it("groups the same vacancy when Arbetsförmedlingen splits it across municipalities", () => {
    // Arbetsförmedlingen publicerar samma tjänst en gång per kommun, med olika
    // id och olika ansökningslänk men samma fysiska arbetsplats.
    const ads = deduplicateJobtechAds([
      ad({
        id: "31330531",
        application_details: { url: "https://jobs.example.se/apply?id=31330531" },
        workplace_address: { municipality: "Göteborg", postcode: "429 22", country: "Sverige" },
      }),
      ad({
        id: "31330518",
        application_details: { url: "https://jobs.example.se/apply?id=31330518" },
        workplace_address: { municipality: "Kungsbacka", postcode: "42922", country: "Sverige" },
      }),
    ]);

    expect(ads.map((item) => item.id)).toEqual(["31330531"]);
  });

  it("keeps a staffing agency assignment that is offered in several cities", () => {
    // Uppdraget gäller på riktigt i alla tre städerna. Den som söker jobb i
    // Uppsala ska hitta det, så posterna får inte slås ihop till en ort.
    const posting = (id: string, municipality: string) => ad({
      id,
      headline: "Socionom till konsultuppdrag",
      application_details: { url: "https://bemanning.example.se" },
      workplace_address: { municipality, country: "Sverige" },
    });

    const ads = deduplicateJobtechAds([
      posting("100", "Stockholm"),
      posting("101", "Göteborg"),
      posting("102", "Uppsala"),
    ]);

    expect(ads.map((item) => item.id)).toEqual(["100", "101", "102"]);
  });

  it("still groups repeated records within one city", () => {
    const posting = (id: string) => ad({
      id,
      headline: "Socionom till konsultuppdrag",
      application_details: { url: "https://bemanning.example.se" },
      workplace_address: { municipality: "Stockholm", country: "Sverige" },
    });

    expect(deduplicateJobtechAds([posting("100"), posting("101")]).map((item) => item.id))
      .toEqual(["101"]);
  });

  it("keeps different vacancies at the same address apart", () => {
    const ads = deduplicateJobtechAds([
      ad({ id: "100", workplace_address: { postcode: "42922", country: "Sverige" } }),
      ad({
        id: "101",
        headline: "Behandlingspedagog till vuxenenheten",
        application_details: { url: "https://jobs.example.se/apply?id=43" },
        workplace_address: { postcode: "42922", country: "Sverige" },
      }),
    ]);

    expect(ads.map((item) => item.id)).toEqual(["100", "101"]);
  });

  it("matches identical advert texts within a city even when the links differ", () => {
    const text = "Vi söker en kollega till vår enhet. ".repeat(10);
    const posting = (id: string, municipality: string) => ad({
      id,
      application_details: { url: `https://jobs.example.se/apply?id=${id}` },
      description: { text },
      workplace_address: { municipality, country: "Sverige" },
    });

    // Samma stad och samma text – en och samma tjänst.
    expect(deduplicateJobtechAds([posting("100", "Göteborg"), posting("101", "Göteborg")])
      .map((item) => item.id)).toEqual(["101"]);

    // Olika städer – två tjänster, båda ska synas.
    expect(deduplicateJobtechAds([posting("100", "Göteborg"), posting("101", "Kungsbacka")])
      .map((item) => item.id)).toEqual(["100", "101"]);
  });

  it("requires matching content and location when no stronger identity exists", () => {
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
