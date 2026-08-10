import { describe, expect, it, vi } from "vitest";
import type { OccupationCategory } from "@/config/jobs";
import type { Region } from "@/config/regions";

const countJobs = vi.hoisted(() => vi.fn());
vi.mock("@/integrations/jobtech/search", () => ({ countJobs }));

const { isIndexableLanding, landingFilters } = await import("./landing");

const occupation: OccupationCategory = {
  slug: "socialsekreterare",
  label: "Socialsekreterare",
  shortLabel: "Socialsekreterare",
  description: "",
  groupIds: ["pok1_ipJ_yzD"],
};
const region: Region = {
  slug: "skane",
  label: "Skåne län",
  shortLabel: "Skåne",
  conceptId: "CaRE_1nn_cSU",
};

describe("landingFilters", () => {
  it("builds the same catalog cache key whether or not remote is passed", () => {
    const implicit = JSON.stringify(landingFilters({ occupation, region }));
    const explicit = JSON.stringify(landingFilters({ occupation, region, remote: false }));

    expect(implicit).toBe(explicit);
    expect(implicit).toContain('"remote":false');
  });

  it("carries the occupation's own narrowing into the filters", () => {
    expect(landingFilters({ occupation, region })).toEqual({
      query: undefined,
      occupationGroupIds: ["pok1_ipJ_yzD"],
      occupationNameIds: undefined,
      regionId: "CaRE_1nn_cSU",
      remote: false,
      sort: "pubdate-desc",
    });
  });
});

describe("isIndexableLanding", () => {
  it("keeps thin combinations out of the index", async () => {
    countJobs.mockResolvedValueOnce(4);
    await expect(isIndexableLanding({ occupation, region })).resolves.toBe(false);
  });

  it("indexes a combination that reaches the threshold", async () => {
    countJobs.mockResolvedValueOnce(5);
    await expect(isIndexableLanding({ occupation, region })).resolves.toBe(true);
  });

  it("counts with the landing's own filters", async () => {
    countJobs.mockResolvedValueOnce(12);
    await isIndexableLanding({ occupation, region });

    expect(countJobs).toHaveBeenCalledWith(landingFilters({ occupation, region }));
  });
});
