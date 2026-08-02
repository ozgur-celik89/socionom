export type JobtechTaxonomyItem = {
  concept_id?: string | null;
  label?: string | null;
  legacy_ams_taxonomy_id?: string | null;
};

export type JobtechAd = {
  id?: string | null;
  webpage_url?: unknown;
  logo_url?: string | null;
  headline?: string | null;
  application_deadline?: string | null;
  number_of_vacancies?: number | null;
  description?: {
    text?: string | null;
    text_formatted?: string | null;
  } | null;
  employment_type?: JobtechTaxonomyItem | null;
  duration?: JobtechTaxonomyItem | null;
  working_hours_type?: JobtechTaxonomyItem | null;
  scope_of_work?: {
    min?: number | null;
    max?: number | null;
  } | null;
  employer?: {
    name?: string | null;
    url?: string | null;
    workplace?: string | null;
  } | null;
  application_details?: {
    url?: string | null;
    email?: string | null;
    via_af?: boolean | null;
  } | null;
  occupation?: JobtechTaxonomyItem | null;
  occupation_group?: JobtechTaxonomyItem | null;
  occupation_field?: JobtechTaxonomyItem | null;
  workplace_address?: {
    municipality?: string | null;
    municipality_concept_id?: string | null;
    region?: string | null;
    region_concept_id?: string | null;
    country?: string | null;
    country_code?: string | null;
    street_address?: string | null;
    postcode?: string | null;
    city?: string | null;
    coordinates?: number[] | null;
  } | null;
  publication_date?: string | null;
  last_publication_date?: string | null;
  removed?: boolean | null;
  removed_date?: string | null;
  remote?: boolean | null;
  timestamp?: number | null;
};

export type JobtechSearchResponse = {
  total?: { value?: number | null } | null;
  hits?: JobtechAd[] | null;
};
