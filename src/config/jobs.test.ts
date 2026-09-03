import { describe, expect, it } from "vitest";
import {
  coreOccupationGroupIds,
  excludedOccupationNameIds,
  getBestOccupationCategory,
  getOccupationCategory,
  occupationCategories,
  occupationGroupIds,
  occupationNameIds,
} from "./jobs";

describe("core occupation selection", () => {
  it("includes every occupation group represented by the first editorial categories", () => {
    expect(coreOccupationGroupIds).toEqual(expect.arrayContaining([
      occupationGroupIds.socialsekreterare,
      occupationGroupIds.kuratorer,
      occupationGroupIds.bistandsbedomare,
      occupationGroupIds.socialtArbeteOvrigt,
      occupationGroupIds.behandlingsassistenter,
    ]));
  });

  it("excludes adjacent occupation names that are not normally socionom roles", () => {
    expect(excludedOccupationNameIds).toEqual([
      "NSEG_DmQ_waj",
      "KJoL_2hp_Sa5",
      "Vq8N_Qvz_i4u",
    ]);
  });

  it("keeps the Kurator landing page within verified curator occupations", () => {
    expect(getOccupationCategory("kurator")?.occupationNameIds).toEqual([
      occupationNameIds.kurator,
      occupationNameIds.skolkurator,
      occupationNameIds.halsoOchSjukvardskurator,
    ]);
  });
});

describe("getBestOccupationCategory", () => {
  const socialsekreterare = [occupationGroupIds.socialsekreterare];
  const kuratorer = [occupationGroupIds.kuratorer];

  it("prefers the most specific title term over a shorter one it contains", () => {
    expect(getBestOccupationCategory("Skolkurator till Bobergsskolan", kuratorer)?.slug)
      .toBe("skolkurator");
    expect(getBestOccupationCategory("Kurator till elevhälsan", kuratorer)?.slug)
      .toBe("kurator");
  });

  it("does not let the generic word socionom decide the category", () => {
    // query: "socionom" är ett sökfilter för behandlingsassistentsidan och får
    // inte klassa varje rubrik som råkar innehålla yrkets namn.
    expect(getBestOccupationCategory("Specialistsocionom till Barn- och ungdomsenheten", socialsekreterare)?.slug)
      .toBe("socialsekreterare");
    expect(getBestOccupationCategory("Socionom med erfarenhet av barn och unga", socialsekreterare)?.slug)
      .toBe("socialsekreterare");
  });

  it("keeps an editorial title override that crosses occupation groups", () => {
    expect(getBestOccupationCategory("Familjebehandlare till Hemmaplansteamet", socialsekreterare)?.slug)
      .toBe("familjebehandlare");
  });

  it("falls back to the occupation group when the title names no role", () => {
    expect(getBestOccupationCategory("Vill du göra skillnad hos oss?", kuratorer)?.slug)
      .toBe("kurator");
    expect(getBestOccupationCategory("Vill du göra skillnad hos oss?", [])).toBeUndefined();
  });

  it("gives every category a title term so none is unreachable", () => {
    for (const category of occupationCategories) {
      expect(category.titleTerms.length).toBeGreaterThan(0);
    }
  });
});
