import { describe, expect, it } from "vitest";
import { mapJobtechAd, mapJobtechAdSummary, mapJobtechSitemapJob } from "./mapper";

describe("mapJobtechAd", () => {
  it("maps and sanitizes a valid JobSearch ad", () => {
    const job = mapJobtechAd({
      id: "123",
      headline: "Socialsekreterare till barn och unga",
      webpage_url: "https://arbetsformedlingen.se/platsbanken/annonser/123",
      publication_date: "2099-07-30T10:00:00",
      application_deadline: "2099-08-30T23:59:59",
      description: {
        text: "Ett viktigt arbete.",
        text_formatted: '<p>Ett viktigt arbete.</p><script>alert("xss")</script>',
      },
      employer: { name: "Exempelkommunen" },
      application_details: { url: "https://example.se/ansok" },
      occupation: { concept_id: "occupation", label: "Socialsekreterare" },
      occupation_group: { concept_id: "pok1_ipJ_yzD", label: "Socialsekreterare" },
      workplace_address: { municipality: "Uppsala", country: "Sverige" },
    });

    expect(job?.slug).toBe("socialsekreterare-till-barn-och-unga");
    expect(job?.descriptionHtml).toContain("Ett viktigt arbete.");
    expect(job?.descriptionHtml).not.toContain("script");
    expect(job?.applyUrl).toBe("https://example.se/ansok");
  });

  it("rejects removed and incomplete ads", () => {
    expect(mapJobtechAd({ id: "1", headline: "Jobb", removed: true })).toBeNull();
    expect(mapJobtechAd({ id: "1", headline: "Jobb" })).toBeNull();
  });

  it("rejects expired ads and ads without a usable description", () => {
    expect(mapJobtechAd({
      id: "expired",
      headline: "Kurator",
      webpage_url: "https://arbetsformedlingen.se/platsbanken/annonser/expired",
      publication_date: "2020-01-01T10:00:00",
      application_deadline: "2020-01-31",
      description: { text: "Beskrivning" },
    })).toBeNull();

    expect(mapJobtechAd({
      id: "empty",
      headline: "Kurator",
      webpage_url: "https://arbetsformedlingen.se/platsbanken/annonser/empty",
      publication_date: "2099-01-01T10:00:00",
      description: { text: "   ", text_formatted: "<p> </p>" },
    })).toBeNull();
  });

  it("derives plain text from formatted descriptions and respects the API remote flag", () => {
    const job = mapJobtechAd({
      id: "formatted",
      headline: "Kurator på distans",
      webpage_url: "https://arbetsformedlingen.se/platsbanken/annonser/formatted",
      publication_date: "2099-01-01T10:00:00",
      description: { text_formatted: "<p>Viktigt <strong>arbete</strong>.</p>" },
      remote: false,
    });

    expect(job?.descriptionText).toBe("Viktigt arbete.");
    expect(job?.remote).toBe(false);
  });

  it("wraps formatted API text without block elements in paragraphs", () => {
    const job = mapJobtechAd({
      id: "plain-formatted",
      headline: "Kurator",
      webpage_url: "https://arbetsformedlingen.se/platsbanken/annonser/plain-formatted",
      publication_date: "2099-01-01T10:00:00",
      description: { text_formatted: "Första raden.\n\nAndra raden." },
    });

    expect(job?.descriptionHtml).toBe("<p>Första raden.</p><p>Andra raden.</p>");
  });

  it("falls back to the source URL for applications", () => {
    const job = mapJobtechAd({
      id: "123",
      headline: "Kurator",
      webpage_url: "https://arbetsformedlingen.se/platsbanken/annonser/123",
      publication_date: "2099-07-30T10:00:00",
      description: { text: "Beskrivning" },
      employer: { name: "Arbetsgivaren" },
      application_details: { url: "javascript:alert(1)" },
    });

    expect(job?.applyUrl).toBe("https://arbetsformedlingen.se/platsbanken/annonser/123");
  });
});

describe("mapJobtechAdSummary", () => {
  it("keeps every field shown on a job card without mapping formatted HTML", () => {
    const job = mapJobtechAdSummary({
      id: "summary",
      headline: "Kurator med möjlighet till distansarbete",
      webpage_url: "https://arbetsformedlingen.se/platsbanken/annonser/summary",
      publication_date: "2099-07-20T10:00:00",
      application_deadline: "2099-09-06T23:59:59",
      description: {
        text: "Arbetet kan utföras delvis på distans.",
        text_formatted: "<p>Den fullständiga annonsen ska inte behöva mappas för kortet.</p>",
      },
      employer: { name: "Exempelkommunen" },
      employment_type: { label: "Tills vidare" },
      duration: { label: "Tillsvidare" },
      working_hours_type: { label: "Heltid" },
      scope_of_work: { min: 100, max: 100 },
      workplace_address: { municipality: "Strängnäs", region: "Södermanlands län", country: "Sverige" },
    });

    expect(job).toMatchObject({
      id: "summary",
      slug: "kurator-med-mojlighet-till-distansarbete",
      employerName: "Exempelkommunen",
      employmentType: "Tills vidare",
      duration: "Tillsvidare",
      workingHours: "Heltid",
      scopeMin: 100,
      scopeMax: 100,
      remote: true,
      publishedAt: "2099-07-20T10:00:00",
      expiresAt: "2099-09-06T23:59:59",
    });
    expect(job?.locations[0]?.municipality).toBe("Strängnäs");
    expect(job).not.toHaveProperty("descriptionHtml");
    expect(job).not.toHaveProperty("descriptionText");
  });

  it("rejects invalid source URLs and expired summaries", () => {
    expect(mapJobtechAdSummary({
      id: "invalid-url",
      headline: "Kurator",
      webpage_url: "javascript:alert(1)",
      publication_date: "2099-01-01T10:00:00",
    })).toBeNull();

    expect(mapJobtechAdSummary({
      id: "expired-summary",
      headline: "Kurator",
      webpage_url: "https://arbetsformedlingen.se/platsbanken/annonser/expired-summary",
      publication_date: "2020-01-01T10:00:00",
      application_deadline: "2020-01-31",
    })).toBeNull();
  });
});

describe("mapJobtechSitemapJob", () => {
  it("maps only the canonical sitemap data", () => {
    const job = mapJobtechSitemapJob({
      id: "sitemap",
      headline: "Socialsekreterare barn och unga",
      publication_date: "2099-01-01T10:00:00",
      application_deadline: "2099-02-01T23:59:59",
      timestamp: 4_102_444_800_000,
    });

    expect(job).toEqual({
      id: "sitemap",
      slug: "socialsekreterare-barn-och-unga",
      sourceUpdatedAt: "2100-01-01T00:00:00.000Z",
    });
  });
});
