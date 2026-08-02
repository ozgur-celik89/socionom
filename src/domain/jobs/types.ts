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

export type JobSearchFilters = {
  query?: string;
  occupationGroupIds?: string[];
  regionId?: string;
  worktimeExtentId?: string;
  remote?: boolean;
  sort?: "relevance" | "pubdate-desc" | "applydate-asc";
  page?: number;
  pageSize?: number;
};

export type JobSearchResult = {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
