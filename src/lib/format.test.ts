import { describe, expect, it } from "vitest";
import { formatApproximateNumber } from "./format";

describe("formatApproximateNumber", () => {
  it("keeps nearby source totals stable at homepage scale", () => {
    expect(formatApproximateNumber(1_025)).toBe("1 000");
    expect(formatApproximateNumber(1_048)).toBe("1 000");
    expect(formatApproximateNumber(1_060)).toBe("1 100");
  });
});
