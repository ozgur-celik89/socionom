export type JobLocation = {
  municipality?: string;
  municipalityConceptId?: string;
  region?: string;
  regionConceptId?: string;
  city?: string;
  streetAddress?: string;
  postcode?: string;
  country: string;
  countryCode?: string;
  coordinates?: [number, number];
};

export type Job = {
  id: string;
  source: "arbetsformedlingen";
  slug: string;
  title: string;
  descriptionHtml: string;
  descriptionText: string;
  employerName: string;
  employerUrl?: string;
  logoUrl?: string;
  locations: JobLocation[];
  occupationConceptIds: string[];
  occupationLabel?: string;
  occupationGroupLabel?: string;
  employmentType?: string;
  employmentTypeConceptId?: string;
  duration?: string;
  workingHours?: string;
  scopeMin?: number;
  scopeMax?: number;
  remote: boolean;
  publishedAt: string;
  expiresAt?: string;
  applyUrl: string;
  sourceUrl: string;
  sourceUpdatedAt?: string;
  vacancies?: number;
};

export type JobSummary = Pick<
  Job,
  | "id"
  | "source"
  | "slug"
  | "title"
  | "employerName"
  | "logoUrl"
  | "locations"
  | "employmentType"
  | "duration"
  | "workingHours"
  | "scopeMin"
  | "scopeMax"
  | "remote"
  | "publishedAt"
  | "expiresAt"
>;

export type SitemapJob = Pick<Job, "id" | "slug"> & {
  sourceUpdatedAt: string;
};

export type JobSearchFilters = {
  query?: string;
  occupationGroupIds?: string[];
  occupationNameIds?: string[];
  regionId?: string;
  worktimeExtentId?: string;
  remote?: boolean;
  sort?: "relevance" | "pubdate-desc" | "applydate-asc";
  page?: number;
  pageSize?: number;
};

export type JobSearchResult = {
  jobs: JobSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
