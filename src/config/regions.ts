export type Region = {
  slug: string;
  label: string;
  shortLabel: string;
  conceptId: string;
  priority?: boolean;
};

export const regions: Region[] = [
  { slug: "stockholm", label: "Stockholms län", shortLabel: "Stockholm", conceptId: "CifL_Rzy_Mku", priority: true },
  { slug: "vastra-gotaland", label: "Västra Götalands län", shortLabel: "Västra Götaland", conceptId: "zdoY_6u5_Krt", priority: true },
  { slug: "skane", label: "Skåne län", shortLabel: "Skåne", conceptId: "CaRE_1nn_cSU", priority: true },
  { slug: "uppsala", label: "Uppsala län", shortLabel: "Uppsala", conceptId: "zBon_eET_fFU", priority: true },
  { slug: "ostergotland", label: "Östergötlands län", shortLabel: "Östergötland", conceptId: "oLT3_Q9p_3nn", priority: true },
  { slug: "jonkoping", label: "Jönköpings län", shortLabel: "Jönköping", conceptId: "MtbE_xWT_eMi", priority: true },
  { slug: "orebro", label: "Örebro län", shortLabel: "Örebro", conceptId: "xTCk_nT5_Zjm", priority: true },
  { slug: "vasterbotten", label: "Västerbottens län", shortLabel: "Västerbotten", conceptId: "g5Tt_CAV_zBd", priority: true },
  { slug: "blekinge", label: "Blekinge län", shortLabel: "Blekinge", conceptId: "DQZd_uYs_oKb" },
  { slug: "dalarna", label: "Dalarnas län", shortLabel: "Dalarna", conceptId: "oDpK_oZ2_WYt" },
  { slug: "gavleborg", label: "Gävleborgs län", shortLabel: "Gävleborg", conceptId: "zupA_8Nt_xcD" },
  { slug: "gotland", label: "Gotlands län", shortLabel: "Gotland", conceptId: "K8iD_VQv_2BA" },
  { slug: "halland", label: "Hallands län", shortLabel: "Halland", conceptId: "wjee_qH2_yb6" },
  { slug: "jamtland", label: "Jämtlands län", shortLabel: "Jämtland", conceptId: "65Ms_7r1_RTG" },
  { slug: "kalmar", label: "Kalmar län", shortLabel: "Kalmar", conceptId: "9QUH_2bb_6Np" },
  { slug: "kronoberg", label: "Kronobergs län", shortLabel: "Kronoberg", conceptId: "tF3y_MF9_h5G" },
  { slug: "norrbotten", label: "Norrbottens län", shortLabel: "Norrbotten", conceptId: "9hXe_F4g_eTG" },
  { slug: "sodermanland", label: "Södermanlands län", shortLabel: "Södermanland", conceptId: "s93u_BEb_sx2" },
  { slug: "varmland", label: "Värmlands län", shortLabel: "Värmland", conceptId: "EVVp_h6U_GSZ" },
  { slug: "vasternorrland", label: "Västernorrlands län", shortLabel: "Västernorrland", conceptId: "NvUF_SP1_1zo" },
  { slug: "vastmanland", label: "Västmanlands län", shortLabel: "Västmanland", conceptId: "G6DV_fKE_Viz" },
];

export const priorityRegions = regions.filter((region) => region.priority);

export function getRegion(slug: string) {
  return regions.find((region) => region.slug === slug);
}

export function getRegionByConceptId(conceptId?: string) {
  return conceptId ? regions.find((region) => region.conceptId === conceptId) : undefined;
}
