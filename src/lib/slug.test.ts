import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("creates a stable ASCII slug from Swedish text", () => {
    expect(slugify("Kurator till Barn- och ungdomshälsan")).toBe(
      "kurator-till-barn-och-ungdomshalsan",
    );
  });
});
