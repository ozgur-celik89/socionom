import { describe, expect, it } from "vitest";
import { hasSearchParams, parseJobSearchParams, parsePage, toPaginationParams } from "./search-params";

describe("job search params", () => {
  it("normalizes supported filters and caps input values", () => {
    const parsed = parseJobSearchParams({
      q: `  ${"socionom ".repeat(20)}  `,
      yrke: "kurator",
      region: "uppsala",
      anstallning: "deltid",
      distans: "1",
      sort: "deadline",
      sida: "3",
    });

    expect(parsed.query?.length).toBeLessThanOrEqual(80);
    expect(parsed.occupation?.slug).toBe("kurator");
    expect(parsed.region?.slug).toBe("uppsala");
    expect(parsed.workingHours?.conceptId).toBe("947z_JGS_Uk2");
    expect(parsed.remote).toBe(true);
    expect(parsed.sort).toBe("applydate-asc");
    expect(parsed.page).toBe(3);
  });

  it("limits pagination and drops unknown parameters from pagination links", () => {
    expect(parsePage("999")).toBe(101);
    expect(parsePage("-2")).toBe(1);

    const params = toPaginationParams({ q: "kurator", okand: "hemligt", sida: "4" });
    expect(params.toString()).toBe("q=kurator");
  });

  it("detects sort-only and other filtered URLs", () => {
    expect(hasSearchParams({ sort: "senaste" })).toBe(true);
    expect(hasSearchParams({})).toBe(false);
  });
});
