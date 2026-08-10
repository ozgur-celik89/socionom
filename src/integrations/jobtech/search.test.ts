import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getJobById,
  getJobsForSitemap,
  JobSearchUnavailableError,
  searchJobs,
} from "./search";

function validAd({
  id = "123",
  headline = "Socialsekreterare till barn och unga",
  occupationGroupId = "pok1_ipJ_yzD",
  occupationNameId = "socialsekreterare",
  applicationUrl,
}: {
  id?: string;
  headline?: string;
  occupationGroupId?: string;
  occupationNameId?: string;
  applicationUrl?: string;
} = {}) {
  return {
    id,
    headline,
    webpage_url: `https://arbetsformedlingen.se/platsbanken/annonser/${id}`,
    publication_date: "2099-01-01T10:00:00",
    application_deadline: "2099-02-01T23:59:59",
    description: { text: "Ett viktigt arbete." },
    application_details: { url: applicationUrl ?? `https://example.se/ansok/${id}` },
    employer: { name: "Exempelkommunen" },
    occupation: { concept_id: occupationNameId, label: "Socialsekreterare" },
    occupation_group: { concept_id: occupationGroupId, label: "Socialsekreterare" },
    workplace_address: { region: "Stockholms län", country: "Sverige" },
  };
}

function fetchCalls(fetchMock: ReturnType<typeof vi.fn>, field: string) {
  return fetchMock.mock.calls.filter((call) => {
    const options = call[1] as { headers?: Record<string, string> } | undefined;
    return options?.headers?.["X-Fields"]?.includes(field);
  });
}

/** Katalogen hämtas utan annonstext; sidhämtningen är den som tar med den. */
const catalogCalls = (fetchMock: ReturnType<typeof vi.fn>) =>
  fetchCalls(fetchMock, "hits{").filter((call) => {
    const options = call[1] as { headers?: Record<string, string> };
    return !options.headers?.["X-Fields"]?.includes("description{text}");
  });

const pageCalls = (fetchMock: ReturnType<typeof vi.fn>) => fetchCalls(fetchMock, "description{text}");

/** Svarar på limit och offset så att paginering går att verifiera på riktigt. */
function stubJobSearch(ads: ReturnType<typeof validAd>[]) {
  return vi.fn(async (url: URL) => {
    const offset = Number(url.searchParams.get("offset") ?? "0");
    const limit = Number(url.searchParams.get("limit") ?? "10");

    return {
      ok: true,
      json: async () => ({ total: { value: ads.length }, hits: ads.slice(offset, offset + limit) }),
    };
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("JobSearch request", () => {
  it("uses the official worktime-extent parameter for full-time and part-time filters", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ total: { value: 0 }, hits: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await searchJobs({ worktimeExtentId: "947z_JGS_Uk2" });

    const requestedUrl = catalogCalls(fetchMock)[0]?.[0];
    expect(requestedUrl).toBeInstanceOf(URL);
    expect((requestedUrl as URL).searchParams.get("worktime-extent")).toBe("947z_JGS_Uk2");
    expect((requestedUrl as URL).searchParams.has("working-hours-type")).toBe(false);
    expect((requestedUrl as URL).searchParams.get("country")).toBe("i46j_HmG_v64");
    expect((requestedUrl as URL).searchParams.getAll("occupation-name")).toEqual([
      "-NSEG_DmQ_waj",
      "-KJoL_2hp_Sa5",
      "-Vq8N_Qvz_i4u",
    ]);

    const catalogFields = (catalogCalls(fetchMock)[0]?.[1] as { headers?: Record<string, string> })
      .headers?.["X-Fields"] ?? "";
    expect(catalogFields).toContain("workplace_address{municipality,region,postcode}");
    expect(catalogFields).not.toContain("description");
    expect((requestedUrl as URL).searchParams.get("limit")).toBe("100");
    expect((requestedUrl as URL).searchParams.get("offset")).toBe("0");
  });

  it("requests the fields a job card needs only for the ads on the page", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ total: { value: 1 }, hits: [validAd()] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await searchJobs();

    const pageOptions = pageCalls(fetchMock)[0]?.[1] as { headers?: Record<string, string> };
    expect(pageOptions.headers?.["X-Fields"]).toContain("working_hours_type{label}");
    expect(pageOptions.headers?.["X-Fields"]).toContain("application_details{url}");
    expect(pageOptions.headers?.["X-Fields"]).not.toContain("text_formatted");
  });

  it("uses the selected region without the broader Sweden geography", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ total: { value: 0 }, hits: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await searchJobs({ regionId: "CifL_Rzy_Mku" });

    const requestedUrl = fetchMock.mock.calls[0]?.[0] as URL;
    expect(requestedUrl.searchParams.get("region")).toBe("CifL_Rzy_Mku");
    expect(requestedUrl.searchParams.has("country")).toBe(false);
  });

  it("supports verified positive occupation names for editorial landing pages", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ total: { value: 0 }, hits: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await searchJobs({ occupationNameIds: ["kurator", "skolkurator"] });

    const requestedUrl = fetchMock.mock.calls[0]?.[0] as URL;
    expect(requestedUrl.searchParams.getAll("occupation-name")).toEqual([
      "kurator",
      "skolkurator",
    ]);
    expect(requestedUrl.searchParams.has("occupation-group")).toBe(false);
  });

  it("retries once before reporting that JobSearch is unavailable", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network unavailable"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchJobs()).rejects.toBeInstanceOf(JobSearchUnavailableError);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("only maps ads that belong to the approved core selection", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        total: { value: 2 },
        hits: [validAd(), validAd({ occupationGroupId: "other-group" })],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await searchJobs();

    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0]?.id).toBe("123");
  });

  it("rejects placeholder titles without rejecting unusual real titles", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        total: { value: 3 },
        hits: [
          validAd({ id: "placeholder", headline: "Standard" }),
          validAd({ id: "family-home", headline: "Familjehem" }),
          validAd({ id: "real", headline: "Vi söker en Arbetsledare!" }),
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await searchJobs();

    expect(result.jobs.map((job) => job.id)).toEqual(["real"]);
  });

  it("deduplicates records that lead to the same application", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        total: { value: 3 },
        hits: [
          validAd({ id: "100", applicationUrl: "https://example.se/ansok/duplicate" }),
          validAd({ id: "101", applicationUrl: "https://example.se/ansok/duplicate" }),
          validAd({ id: "102" }),
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await searchJobs();

    expect(result.jobs.map((job) => job.id)).toEqual(["101", "102"]);
  });

  it("fills every page from the filtered result instead of from the raw JobSearch page", async () => {
    // Var femte träff sorteras bort. Skulle pagineringen ske före filtret
    // skulle varje sida tappa fyra jobb.
    const ads = Array.from({ length: 50 }, (_, index) => validAd({
      id: String(1000 + index),
      applicationUrl: `https://example.se/ansok/${1000 + index}`,
      occupationGroupId: index % 5 === 4 ? "other-group" : "pok1_ipJ_yzD",
    }));
    vi.stubGlobal("fetch", stubJobSearch(ads));

    const firstPage = await searchJobs({ page: 1, pageSize: 20 });
    const secondPage = await searchJobs({ page: 2, pageSize: 20 });

    expect(firstPage.total).toBe(40);
    expect(firstPage.totalPages).toBe(2);
    expect(firstPage.jobs).toHaveLength(20);
    expect(secondPage.jobs).toHaveLength(20);
    expect(secondPage.jobs[0]?.id).toBe("1025");
    expect(new Set([...firstPage.jobs, ...secondPage.jobs].map((job) => job.id)).size).toBe(40);
  });

  it("never offers a page beyond the filtered result", async () => {
    const ads = Array.from({ length: 30 }, (_, index) => validAd({
      id: String(2000 + index),
      applicationUrl: `https://example.se/ansok/${2000 + index}`,
      occupationGroupId: index < 25 ? "pok1_ipJ_yzD" : "other-group",
    }));
    vi.stubGlobal("fetch", stubJobSearch(ads));

    const result = await searchJobs({ page: 9, pageSize: 20 });

    expect(result.total).toBe(25);
    expect(result.totalPages).toBe(2);
    expect(result.page).toBe(2);
    expect(result.jobs).toHaveLength(5);
  });

  it("loads only the window a later page needs instead of rescanning earlier pages", async () => {
    const ads = Array.from({ length: 60 }, (_, index) => validAd({
      id: String(3000 + index),
      applicationUrl: `https://example.se/ansok/${3000 + index}`,
    }));
    const fetchMock = stubJobSearch(ads);
    vi.stubGlobal("fetch", fetchMock);

    await searchJobs({ page: 3, pageSize: 20 });

    const windows = pageCalls(fetchMock).map((call) => {
      const url = call[0] as URL;
      return {
        offset: Number(url.searchParams.get("offset")),
        limit: Number(url.searchParams.get("limit")),
      };
    });

    expect(windows).toHaveLength(1);
    expect(windows[0].offset).toBeLessThanOrEqual(40);
    expect(windows[0].offset).toBeGreaterThan(30);
    expect(windows[0].offset + windows[0].limit).toBeGreaterThanOrEqual(60);
  });

  it("does not expose individual ads outside the approved core selection", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => validAd({ occupationGroupId: "other-group" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => validAd({ occupationNameId: "NSEG_DmQ_waj" }),
      });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getJobById("123")).resolves.toBeNull();
    await expect(getJobById("124")).resolves.toBeNull();
  });

  it("keeps relevant individual ads available", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => validAd(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const job = await getJobById("123");

    expect(job?.id).toBe("123");
    expect(job?.slug).toBe("socialsekreterare-till-barn-och-unga");
    const requestOptions = fetchMock.mock.calls[0]?.[1] as { headers?: Record<string, string> };
    expect(requestOptions.headers?.["X-Fields"]).toBeUndefined();
  });

  it("loads sitemap pages with a minimal one-hour-cached response", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total: { value: 101 }, hits: [validAd({ id: "first" })] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total: { value: 101 }, hits: [validAd({ id: "second", headline: "Kurator" })] }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const jobs = await getJobsForSitemap();

    expect(jobs).toEqual([
      expect.objectContaining({ id: "first", slug: "socialsekreterare-till-barn-och-unga" }),
      expect.objectContaining({ id: "second", slug: "kurator" }),
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const firstOptions = fetchMock.mock.calls[0]?.[1] as {
      headers?: Record<string, string>;
      next?: { revalidate?: number };
    };
    const secondUrl = fetchMock.mock.calls[1]?.[0] as URL;
    expect(firstOptions.headers?.["X-Fields"]).toContain("timestamp");
    expect(firstOptions.headers?.["X-Fields"]).not.toContain("description");
    expect(firstOptions.next?.revalidate).toBe(3600);
    expect(secondUrl.searchParams.get("offset")).toBe("100");
  });

  it("keeps placeholder titles out of the sitemap", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        total: { value: 2 },
        hits: [
          validAd({ id: "placeholder", headline: "Standard" }),
          validAd({ id: "real", headline: "Kurator till ungdomsmottagning" }),
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const jobs = await getJobsForSitemap();

    expect(jobs.map((job) => job.id)).toEqual(["real"]);
  });

});

describe("bortvalda annonser", () => {
  it("räknar hur många av källans träffar som inte kom med", async () => {
    // Två uppdrag som inte är anställningar och en dubblett av den riktiga.
    // Dubbletten delar ansökningslänk, vilket är det katalogen matchar på.
    vi.stubGlobal("fetch", stubJobSearch([
      validAd({ id: "riktig", applicationUrl: "https://example.se/ansok/1" }),
      validAd({ id: "dubblett", applicationUrl: "https://example.se/ansok/1" }),
      validAd({ id: "uppdrag-1", headline: "Familjehem" }),
      validAd({ id: "uppdrag-2", headline: "familjehem" }),
    ]));

    const result = await searchJobs();

    expect(result.total).toBe(1);
    expect(result.filteredOut).toBe(3);
  });

  it("håller tyst när träfflistan är längre än katalogen kan nå", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: URL) => ({
      ok: true,
      json: async () => ({
        // Över offset-taket: skillnaden mot listan skulle vara påhittad.
        total: { value: 5_000 },
        hits: Number(url.searchParams.get("offset") ?? "0") === 0 ? [validAd()] : [],
      }),
    })));

    const result = await searchJobs();

    expect(result.filteredOut).toBeUndefined();
  });
});
