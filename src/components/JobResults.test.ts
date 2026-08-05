import { describe, expect, it } from "vitest";
import { getJobResultsHeading } from "./JobResults";

describe("getJobResultsHeading", () => {
  it("describes the unfiltered result", () => {
    expect(getJobResultsHeading(905)).toBe("905 lediga socionomjobb");
  });

  it("combines occupation and region", () => {
    expect(getJobResultsHeading(42, {
      occupationLabel: "Kurator",
      regionLabel: "Stockholm",
    })).toBe("42 lediga jobb som kurator i Stockholm");
  });

  it("preserves uppercase abbreviations in occupation names", () => {
    expect(getJobResultsHeading(8, {
      occupationLabel: "LSS-handläggare",
    })).toBe("8 lediga jobb som LSS-handläggare");
  });

  it("prioritizes a free-text query and keeps the region", () => {
    expect(getJobResultsHeading(12, {
      query: "barn och unga",
      occupationLabel: "Socialsekreterare",
      regionLabel: "Skåne",
    })).toBe("12 jobb för ”barn och unga” i Skåne");
  });

  it("describes a remote-only result", () => {
    expect(getJobResultsHeading(18, { remote: true }))
      .toBe("18 socionomjobb med möjlighet till distans");
  });

  it("uses singular grammar", () => {
    expect(getJobResultsHeading(1, { occupationLabel: "Skolkurator" }))
      .toBe("1 ledigt jobb som skolkurator");
  });
});
