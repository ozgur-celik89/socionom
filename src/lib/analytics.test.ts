import { describe, expect, it } from "vitest";
import { getSearchAnalyticsProperties } from "./analytics";

describe("getSearchAnalyticsProperties", () => {
  it("keeps controlled filter values without including the query", () => {
    expect(getSearchAnalyticsProperties({
      query: "känslig fritext",
      occupation: "kurator",
      region: "stockholm",
      workingHours: "heltid",
      remote: "1",
      sort: "deadline",
      source: "full",
    })).toEqual({
      source: "full",
      has_query: true,
      filter_count: 4,
      occupation: "kurator",
      region: "stockholm",
      working_hours: "heltid",
      remote: true,
      sort: "deadline",
    });
  });

  it("replaces manipulated values with controlled fallbacks", () => {
    expect(getSearchAnalyticsProperties({
      query: "",
      occupation: "egen-yrkesroll",
      region: "egen-region",
      workingHours: "egen-omfattning",
      remote: "yes",
      sort: "egen-sortering",
      source: "hero",
    })).toEqual({
      source: "hero",
      has_query: false,
      filter_count: 0,
      occupation: "alla",
      region: "hela_sverige",
      working_hours: "alla",
      remote: false,
      sort: "senaste",
    });
  });

  it("uses relevance as the implicit sort for free-text searches", () => {
    expect(getSearchAnalyticsProperties({
      query: "skolkurator",
      occupation: null,
      region: null,
      workingHours: null,
      remote: null,
      sort: null,
      source: "hero",
    }).sort).toBe("relevans");
  });
});
