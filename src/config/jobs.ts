export type OccupationCategory = {
  slug: string;
  label: string;
  shortLabel: string;
  description: string;
  groupIds: string[];
  occupationNameIds?: string[];
  /** Fritextfilter mot JobSearch när landningssidan hämtar sina annonser. */
  query?: string;
  /**
   * Termer som pekar ut kategorin i en annonsrubrik. Håll dem åtskilda från
   * query: det är ett sökfilter och kan vara för brett för att klassa på – ett
   * query som "socionom" skulle fånga nästan varje rubrik på sajten.
   */
  titleTerms: string[];
};

export const occupationGroupIds = {
  socialsekreterare: "pok1_ipJ_yzD",
  kuratorer: "dJXy_Rpq_a2u",
  bistandsbedomare: "5uP5_Ugw_aVE",
  socialtArbeteOvrigt: "n6iX_f2z_XfE",
  behandlingsassistenter: "BWwk_fYX_S5B",
} as const;

export const occupationNameIds = {
  kurator: "YpRs_ybt_47a",
  skolkurator: "31sh_tuy_pwG",
  halsoOchSjukvardskurator: "UVvg_XmH_CA4",
} as const;

export const coreOccupationGroupIds = [
  occupationGroupIds.socialsekreterare,
  occupationGroupIds.kuratorer,
  occupationGroupIds.bistandsbedomare,
  occupationGroupIds.socialtArbeteOvrigt,
  occupationGroupIds.behandlingsassistenter,
];

// Närliggande roller i samma breda JobTech-grupp som normalt inte är socionomjobb.
export const excludedOccupationNameIds = [
  "NSEG_DmQ_waj", // Stödpedagog
  // Ersättningskedjan för Personligt ombud drar även in bland annat
  // kundansvariga inom personlig assistans och annonser för familjehem.
  "KJoL_2hp_Sa5",
  "Vq8N_Qvz_i4u", // Integrationshandläggare
];

// Kontrollera alltid deprecated och replaced_by i taxonomin innan en benämning
// läggs till ovan. En avvecklad benämning exkluderar hela sin ersättningskedja,
// vilket lätt tar med kärnyrken. Exempel: Ungdomsassistent (dPjj_QXm_fHR) och
// Rehabiliteringsassistent (Qgk2_se1_PZR) ersätts båda av
// Behandlingsassistent/Socialpedagog och tömmer därmed den yrkesgruppen.

export const occupationCategories: OccupationCategory[] = [
  {
    slug: "socialsekreterare",
    label: "Socialsekreterare",
    shortLabel: "Socialsekreterare",
    description:
      "Hitta aktuella tjänster inom myndighetsutövning, barn och unga, vuxen, ekonomiskt bistånd och andra delar av socialtjänsten.",
    groupIds: [occupationGroupIds.socialsekreterare],
    titleTerms: ["socialsekreterare"],
  },
  {
    slug: "kurator",
    label: "Kurator",
    shortLabel: "Kurator",
    description:
      "Se kuratorstjänster inom bland annat vård, skola, företagshälsa och psykosocialt stöd.",
    groupIds: [occupationGroupIds.kuratorer],
    occupationNameIds: [
      occupationNameIds.kurator,
      occupationNameIds.skolkurator,
      occupationNameIds.halsoOchSjukvardskurator,
    ],
    titleTerms: ["kurator"],
  },
  {
    slug: "bistandshandlaggare",
    label: "Biståndshandläggare",
    shortLabel: "Biståndshandläggare",
    description:
      "Hitta jobb inom biståndsbedömning, äldreomsorg, funktionsstöd och kommunal handläggning.",
    groupIds: [occupationGroupIds.bistandsbedomare],
    titleTerms: ["biståndshandläggare", "biståndsbedömare"],
  },
  {
    slug: "lss-handlaggare",
    label: "LSS-handläggare",
    shortLabel: "LSS-handläggare",
    description:
      "Se aktuella tjänster med utredning och beslut om stöd enligt LSS och socialtjänstlagen.",
    groupIds: [occupationGroupIds.bistandsbedomare],
    query: "LSS-handläggare",
    titleTerms: ["lss-handläggare", "lss handläggare"],
  },
  {
    slug: "familjebehandlare",
    label: "Familjebehandlare",
    shortLabel: "Familjebehandlare",
    description:
      "Sök behandlande och stödjande roller för barn, unga och familjer.",
    groupIds: [occupationGroupIds.socialsekreterare, occupationGroupIds.kuratorer],
    query: "familjebehandlare",
    titleTerms: ["familjebehandlare"],
  },
  {
    slug: "behandlingsassistent",
    label: "Behandlingsassistent",
    shortLabel: "Behandlingsassistent",
    description:
      "Hitta behandlingsroller där socionomkompetens efterfrågas inom exempelvis HVB, öppenvård och stödverksamhet.",
    groupIds: [occupationGroupIds.behandlingsassistenter],
    query: "socionom",
    titleTerms: ["behandlingsassistent", "socialpedagog"],
  },
];

export type WorkingHoursOption = {
  slug: "heltid" | "deltid";
  label: string;
  conceptId: string;
};

export const workingHoursOptions: WorkingHoursOption[] = [
  { slug: "heltid", label: "Heltid", conceptId: "6YE1_gAC_R2G" },
  { slug: "deltid", label: "Deltid", conceptId: "947z_JGS_Uk2" },
];

export function getOccupationCategory(slug: string) {
  return occupationCategories.find((category) => category.slug === slug);
}

export function getWorkingHoursOption(slug: string) {
  return workingHoursOptions.find((option) => option.slug === slug);
}

// Längsta termen prövas först så att en mer specifik redaktionell kategori
// vinner när dess titelterm innehåller en kortare kategoris titelterm.
const titleMatchers = occupationCategories
  .flatMap((category) => category.titleTerms.map((term) => ({
    category,
    term: term.toLocaleLowerCase("sv-SE"),
  })))
  .sort((a, b) => b.term.length - a.term.length);

/**
 * Kategorin som en annons hör hemma i. Rubriken avgör när den nämner ett yrke
 * vid namn; annars får annonsens yrkesgrupp bestämma. Fallbacken är beroende av
 * ordningen i occupationCategories: den generiska kategorin för en yrkesgrupp
 * måste stå före de smalare som delar samma grupp.
 */
export function getBestOccupationCategory(title: string, conceptIds: string[]) {
  const normalizedTitle = title.toLocaleLowerCase("sv-SE");
  const titleMatch = titleMatchers.find(({ term }) => normalizedTitle.includes(term));

  return titleMatch?.category ?? occupationCategories.find((category) =>
    category.groupIds.some((groupId) => conceptIds.includes(groupId))
  );
}
