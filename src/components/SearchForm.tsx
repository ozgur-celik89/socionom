"use client";

import { track } from "@vercel/analytics";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { occupationCategories, workingHoursOptions } from "@/config/jobs";
import { regions } from "@/config/regions";
import { getSearchAnalyticsProperties } from "@/lib/analytics";
import { ChevronDownIcon, SearchIcon } from "./icons";

export type SearchFormValues = {
  q?: string;
  yrke?: string;
  region?: string;
  anstallning?: string;
  distans?: boolean;
  sort?: string;
};

type RemovableFilterKey = "q" | "yrke" | "region" | "anstallning" | "distans";

function filterHref(values: SearchFormValues, removedKey: RemovableFilterKey) {
  const params = new URLSearchParams();

  if (removedKey !== "q" && values.q) params.set("q", values.q);
  if (removedKey !== "yrke" && values.yrke) params.set("yrke", values.yrke);
  if (removedKey !== "region" && values.region) params.set("region", values.region);
  if (removedKey !== "anstallning" && values.anstallning) params.set("anstallning", values.anstallning);
  if (removedKey !== "distans" && values.distans) params.set("distans", "1");
  if (values.sort) params.set("sort", values.sort);

  const query = params.toString();
  return query ? `/lediga-jobb?${query}` : "/lediga-jobb";
}

export function SearchForm({
  values = {},
  variant = "full",
}: {
  values?: SearchFormValues;
  variant?: "hero" | "full";
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const properties = getSearchAnalyticsProperties({
      query: data.get("q"),
      occupation: data.get("yrke"),
      region: data.get("region"),
      workingHours: data.get("anstallning"),
      remote: data.get("distans"),
      sort: data.get("sort"),
      source: variant,
    });

    track("job_search", properties);
    if (properties.filter_count > 0) track("filter_used", properties);
  }

  if (variant === "hero") {
    return (
      <form action="/lediga-jobb" className="hero-search" method="get" onSubmit={handleSubmit} role="search">
        <div className="field field-search">
          <label htmlFor="hero-q">Yrke eller sökord</label>
          <div className="input-with-icon">
            <SearchIcon />
            <input defaultValue={values.q} id="hero-q" name="q" placeholder="Till exempel kurator" type="search" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="hero-region">Län eller region</label>
          <select defaultValue={values.region ?? ""} id="hero-region" name="region">
            <option value="">Hela Sverige</option>
            {regions.map((region) => (
              <option key={region.slug} value={region.slug}>{region.shortLabel}</option>
            ))}
          </select>
        </div>
        <button className="button button-primary hero-search-button" type="submit">
          <SearchIcon />
          Sök jobb
        </button>
      </form>
    );
  }

  const activeFilters = [
    values.q ? { key: "q" as const, label: `Sökning: ${values.q}` } : null,
    values.yrke ? {
      key: "yrke" as const,
      label: occupationCategories.find((category) => category.slug === values.yrke)?.shortLabel ?? values.yrke,
    } : null,
    values.region ? {
      key: "region" as const,
      label: regions.find((region) => region.slug === values.region)?.shortLabel ?? values.region,
    } : null,
    values.anstallning ? {
      key: "anstallning" as const,
      label: workingHoursOptions.find((option) => option.slug === values.anstallning)?.label ?? values.anstallning,
    } : null,
    values.distans ? { key: "distans" as const, label: "Distans möjligt" } : null,
  ].filter((filter): filter is NonNullable<typeof filter> => filter !== null);
  const hiddenFilterCount = activeFilters.filter((filter) => filter.key !== "q").length;

  return (
    <form action="/lediga-jobb" className="filter-panel" method="get" onSubmit={handleSubmit} role="search">
      <div className="field filter-query">
        <label htmlFor="q">Yrke, arbetsgivare eller sökord</label>
        <div className="input-with-icon">
          <SearchIcon />
          <input defaultValue={values.q} id="q" name="q" placeholder="Sök bland socionomjobb" type="search" />
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div aria-label="Aktiva filter" className="active-filters" role="group">
          <span className="active-filters-label">Aktiva filter</span>
          <div className="active-filter-list">
            {activeFilters.map((filter) => (
              <Link
                aria-label={`Ta bort filtret ${filter.label}`}
                className="active-filter-chip"
                href={filterHref(values, filter.key)}
                key={filter.key}
              >
                {filter.label}<span aria-hidden="true">×</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <button
        aria-controls="additional-job-filters"
        aria-expanded={filtersOpen}
        className={`mobile-filter-toggle${filtersOpen ? " is-open" : ""}`}
        onClick={() => setFiltersOpen((open) => !open)}
        type="button"
      >
        <span>Filter och sortering</span>
        <span className="mobile-filter-toggle-meta">
          {hiddenFilterCount > 0 && <span className="filter-count">{hiddenFilterCount}</span>}
          <ChevronDownIcon />
        </span>
      </button>

      <div className={`filter-controls${filtersOpen ? " is-open" : ""}`} id="additional-job-filters">
        <div className="filter-grid">
          <div className="field">
            <label htmlFor="yrke">Yrkesområde</label>
            <select defaultValue={values.yrke ?? ""} id="yrke" name="yrke">
              <option value="">Alla yrkesområden</option>
              {occupationCategories.map((category) => (
                <option key={category.slug} value={category.slug}>{category.shortLabel}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="region">Län eller region</label>
            <select defaultValue={values.region ?? ""} id="region" name="region">
              <option value="">Hela Sverige</option>
              {regions.map((region) => (
                <option key={region.slug} value={region.slug}>{region.shortLabel}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="anstallning">Omfattning</label>
            <select defaultValue={values.anstallning ?? ""} id="anstallning" name="anstallning">
              <option value="">Heltid och deltid</option>
              {workingHoursOptions.map((option) => (
                <option key={option.slug} value={option.slug}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="sort">Sortering</label>
            <select defaultValue={values.sort ?? ""} id="sort" name="sort">
              <option value="">Mest relevanta</option>
              <option value="senaste">Senast publicerade</option>
              <option value="deadline">Kortast ansökningstid</option>
            </select>
          </div>
        </div>

        <div className="filter-actions">
          <label className="checkbox-field">
            <input defaultChecked={values.distans} name="distans" type="checkbox" value="1" />
            <span>Visa bara jobb med möjlighet till distansarbete</span>
          </label>
          <div className="button-row">
            <Link className="button button-ghost" href="/lediga-jobb">Rensa filter</Link>
            <button className="button button-primary" type="submit">
              <SearchIcon />
              Visa jobb
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
