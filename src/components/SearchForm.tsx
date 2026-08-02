"use client";

import { track } from "@vercel/analytics";
import Link from "next/link";
import type { FormEvent } from "react";
import { occupationCategories, workingHoursOptions } from "@/config/jobs";
import { regions } from "@/config/regions";
import { SearchIcon } from "./icons";

export type SearchFormValues = {
  q?: string;
  yrke?: string;
  region?: string;
  anstallning?: string;
  distans?: boolean;
  sort?: string;
};

export function SearchForm({
  values = {},
  variant = "full",
}: {
  values?: SearchFormValues;
  variant?: "hero" | "full";
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const filterCount = ["yrke", "region", "anstallning", "distans"]
      .filter((key) => Boolean(data.get(key))).length;

    track("job_search", {
      has_query: Boolean(String(data.get("q") ?? "").trim()),
      filter_count: filterCount,
      source: variant,
    });

    if (filterCount > 0) track("filter_used", { filter_count: filterCount });
  }

  if (variant === "hero") {
    return (
      <form action="/jobb" className="hero-search" method="get" onSubmit={handleSubmit} role="search">
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

  return (
    <form action="/jobb" className="filter-panel" method="get" onSubmit={handleSubmit} role="search">
      <div className="field filter-query">
        <label htmlFor="q">Yrke, arbetsgivare eller sökord</label>
        <div className="input-with-icon">
          <SearchIcon />
          <input defaultValue={values.q} id="q" name="q" placeholder="Sök bland socionomjobb" type="search" />
        </div>
      </div>

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
          <Link className="button button-ghost" href="/jobb">Rensa filter</Link>
          <button className="button button-primary" type="submit">
            <SearchIcon />
            Visa jobb
          </button>
        </div>
      </div>
    </form>
  );
}
