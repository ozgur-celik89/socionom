import { describe, expect, it } from "vitest";
import { hasMeaningfulJobTitle } from "./relevance";

describe("job title relevance", () => {
  it.each([
    "Standard",
    " STANDARD! ",
    "Annons",
    "Ledig tjänst",
    "Testannons",
  ])("rejects the placeholder title %s", (title) => {
    expect(hasMeaningfulJobTitle(title)).toBe(false);
  });

  it.each([
    "Kurator",
    "Vi söker en Arbetsledare!",
    "Socialsekreterare barn och unga",
    "Projekt- och samverkansansvarig",
  ])("keeps the real title %s", (title) => {
    expect(hasMeaningfulJobTitle(title)).toBe(true);
  });
});
