import { afterEach, describe, expect, it, vi } from "vitest";
import { formatDate, formatPublishedDate, formatScope, isRecentlyPublished } from "./format";

afterEach(() => {
  vi.useRealTimers();
});

/** Driftservern kör UTC, så det är där tidszonsfel visar sig. */
function atUtc(iso: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
}

describe("formatDate", () => {
  it("keeps a late evening publication on its own day", () => {
    expect(formatDate("2026-09-03T23:30:00")).toBe("3 september 2026");
  });

  it("returns nothing for a missing or malformed date", () => {
    expect(formatDate(undefined)).toBeUndefined();
    expect(formatDate("inte ett datum")).toBeUndefined();
  });
});

describe("isRecentlyPublished", () => {
  it("marks an ad published minutes ago as new", () => {
    atUtc("2026-09-03T08:45:00Z"); // 10:45 svensk tid
    expect(isRecentlyPublished("2026-09-03T10:29:03")).toBe(true);
  });

  it("stops marking an ad older than the window", () => {
    atUtc("2026-09-08T08:45:00Z");
    expect(isRecentlyPublished("2026-09-03T10:29:03")).toBe(false);
  });
});

describe("formatPublishedDate", () => {
  it("says yesterday for last night, not today", () => {
    atUtc("2026-09-03T06:00:00Z"); // 08:00 svensk tid
    expect(formatPublishedDate("2026-09-02T23:30:00")).toBe("Publicerad i går");
  });

  it("says today for an ad published earlier the same morning", () => {
    atUtc("2026-09-03T10:00:00Z");
    expect(formatPublishedDate("2026-09-03T08:15:00")).toBe("Publicerad i dag");
  });

  it("falls back to an absolute date beyond a week", () => {
    atUtc("2026-09-20T10:00:00Z");
    expect(formatPublishedDate("2026-09-03T08:15:00")).toBe("Publicerad 3 september 2026");
  });
});

describe("formatScope", () => {
  it("describes a single and a spanning scope", () => {
    expect(formatScope(100, 100)).toBe("100 %");
    expect(formatScope(75, 100)).toBe("75–100 %");
    expect(formatScope(undefined, undefined)).toBeUndefined();
  });
});
