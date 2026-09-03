import { describe, expect, it } from "vitest";
import { dateInSweden, parseSwedishTimestamp, swedishDayDifference, toIsoTimestamp } from "./time";

describe("parseSwedishTimestamp", () => {
  it("reads a JobSearch timestamp as Swedish local time, not as the server's", () => {
    // Sommartid: 10:29 i Stockholm är 08:29 UTC.
    expect(parseSwedishTimestamp("2026-09-03T10:29:03")?.toISOString())
      .toBe("2026-09-03T08:29:03.000Z");
  });

  it("uses standard time outside the daylight saving period", () => {
    expect(parseSwedishTimestamp("2026-01-15T10:00:00")?.toISOString())
      .toBe("2026-01-15T09:00:00.000Z");
  });

  it("picks the right offset on both sides of the daylight saving change", () => {
    // Sverige ställer om 2026-03-29 02:00 och 2026-10-25 03:00.
    expect(parseSwedishTimestamp("2026-03-29T01:30:00")?.toISOString())
      .toBe("2026-03-29T00:30:00.000Z");
    expect(parseSwedishTimestamp("2026-03-29T03:30:00")?.toISOString())
      .toBe("2026-03-29T01:30:00.000Z");
    expect(parseSwedishTimestamp("2026-10-25T04:00:00")?.toISOString())
      .toBe("2026-10-25T03:00:00.000Z");
  });

  it("accepts a bare date and an explicit time zone", () => {
    expect(parseSwedishTimestamp("2026-09-03")?.toISOString()).toBe("2026-09-02T22:00:00.000Z");
    expect(parseSwedishTimestamp("2026-09-03T08:29:03Z")?.toISOString())
      .toBe("2026-09-03T08:29:03.000Z");
  });

  it("returns null for missing and malformed values", () => {
    expect(parseSwedishTimestamp(undefined)).toBeNull();
    expect(parseSwedishTimestamp("")).toBeNull();
    expect(parseSwedishTimestamp("okänt datum")).toBeNull();
    expect(parseSwedishTimestamp("2026-13-01T10:00:00")).toBeNull();
  });
});

describe("toIsoTimestamp", () => {
  it("gives a sitemap a complete time, not an ambiguous one", () => {
    expect(toIsoTimestamp("2026-09-03T10:29:03")).toBe("2026-09-03T08:29:03.000Z");
    expect(toIsoTimestamp("skräp")).toBeUndefined();
  });
});

describe("dateInSweden", () => {
  it("uses the Swedish calendar date around UTC midnight", () => {
    expect(dateInSweden(new Date("2026-01-01T23:30:00Z"))).toBe("2026-01-02");
  });
});

describe("swedishDayDifference", () => {
  it("counts calendar days, not 24-hour periods", () => {
    const lastNight = new Date("2026-09-02T21:30:00Z"); // 23:30 svensk tid
    const thisMorning = new Date("2026-09-03T06:00:00Z"); // 08:00 svensk tid

    expect(swedishDayDifference(lastNight, thisMorning)).toBe(-1);
    expect(swedishDayDifference(thisMorning, thisMorning)).toBe(0);
  });
});
