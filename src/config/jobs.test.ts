import { describe, expect, it } from "vitest";
import {
  coreOccupationGroupIds,
  excludedOccupationNameIds,
  getOccupationCategory,
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
