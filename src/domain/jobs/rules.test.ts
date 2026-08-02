import { describe, expect, it } from "vitest";
import { dateInSweden, isApplicationDeadlinePassed } from "./rules";

describe("job deadline rules", () => {
  it("uses the Swedish calendar date around UTC midnight", () => {
    expect(dateInSweden(new Date("2026-01-01T23:30:00Z"))).toBe("2026-01-02");
  });

  it("keeps a job active for the entire deadline date", () => {
    const now = new Date("2026-08-02T12:00:00Z");

    expect(isApplicationDeadlinePassed("2026-08-01", now)).toBe(true);
    expect(isApplicationDeadlinePassed("2026-08-02T00:00:00", now)).toBe(false);
    expect(isApplicationDeadlinePassed("2026-08-03", now)).toBe(false);
  });

  it("does not reject a job when the deadline is missing or malformed", () => {
    expect(isApplicationDeadlinePassed(undefined)).toBe(false);
    expect(isApplicationDeadlinePassed("okänt datum")).toBe(false);
  });
});
