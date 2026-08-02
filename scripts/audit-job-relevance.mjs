const API_URL = "https://jobsearch.api.jobtechdev.se/search";
const SWEDEN_CONCEPT_ID = "i46j_HmG_v64";
const OCCUPATION_GROUP_IDS = [
  "pok1_ipJ_yzD", // Socialsekreterare
  "dJXy_Rpq_a2u", // Kuratorer
  "5uP5_Ugw_aVE", // Biståndsbedömare
  "n6iX_f2z_XfE", // Övriga yrken inom socialt arbete
  "BWwk_fYX_S5B", // Behandlingsassistenter och socialpedagoger
];
const TREATMENT_GROUP_ID = "BWwk_fYX_S5B";
const EXCLUDED_OCCUPATION_NAME_IDS = [
  "NSEG_DmQ_waj", // Stödpedagog
];
const selectedGroupIds = process.argv.includes("--treatment-only")
  ? [TREATMENT_GROUP_ID]
  : OCCUPATION_GROUP_IDS;

const excludedTitlePattern = /(?:personlig assistent|boendestödjare|vårdare|undersköterska|stödpedagog)/i;
const socionomPattern = /\bsocionom(?:examen|utbildning|programmet|er|en)?\b/i;

function safeCell(value) {
  const normalized = String(value ?? "").replace(/[\t\r\n]+/g, " ").trim();
  return /^[=+\-@]/.test(normalized) ? `'${normalized}` : normalized;
}

async function getPage(offset) {
  const url = new URL(API_URL);
  url.searchParams.set("limit", "100");
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("resdet", "full");
  url.searchParams.set("country", SWEDEN_CONCEPT_ID);
  url.searchParams.set("sort", "pubdate-desc");

  for (const groupId of selectedGroupIds) {
    url.searchParams.append("occupation-group", groupId);
  }

  for (const occupationNameId of EXCLUDED_OCCUPATION_NAME_IDS) {
    url.searchParams.append("occupation-name", `-${occupationNameId}`);
  }

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`JobSearch svarade med HTTP ${response.status}`);
  }

  return response.json();
}

const pages = await Promise.all([getPage(0), getPage(100)]);
const ads = pages.flatMap((page) => page.hits ?? []).slice(0, 200);

const columns = [
  "id",
  "titel",
  "arbetsgivare",
  "yrkesbenamning",
  "yrkesbenamning_id",
  "yrkesgrupp",
  "publicerad",
  "annons_url",
  "socionom_namns",
  "bred_rollsignal",
  "bedomning_relevant_ja_nej_osaker",
  "kommentar",
];

process.stdout.write(`${columns.join("\t")}\n`);

for (const ad of ads) {
  const title = ad.headline ?? "";
  const description = `${ad.description?.text ?? ""} ${ad.description?.text_formatted ?? ""}`;
  const row = [
    ad.id,
    title,
    ad.employer?.name ?? ad.employer?.workplace,
    ad.occupation?.label,
    ad.occupation?.concept_id,
    ad.occupation_group?.label,
    ad.publication_date,
    ad.webpage_url,
    socionomPattern.test(`${title} ${description}`) ? "ja" : "nej",
    excludedTitlePattern.test(title) ? "ja" : "nej",
    "",
    "",
  ];

  process.stdout.write(`${row.map(safeCell).join("\t")}\n`);
}

if (ads.length < 200) {
  process.stderr.write(`Obs: API:t returnerade bara ${ads.length} annonser för urvalet.\n`);
}
