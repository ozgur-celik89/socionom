import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getCanonicalJobSlug,
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
}: {
  id?: string;
  headline?: string;
  occupationGroupId?: string;
  occupationNameId?: string;
} = {}) {
  return {
    id,
    headline,
    webpage_url: `https://arbetsformedlingen.se/platsbanken/annonser/${id}`,
    publication_date: "2099-01-01T10:00:00",
    application_deadline: "2099-02-01T23:59:59",
    description: { text: "Ett viktigt arbete." },
    employer: { name: "Exempelkommunen" },
    occupation: { concept_id: occupationNameId, label: "Socialsekreterare" },
    occupation_group: { concept_id: occupationGroupId, label: "Socialsekreterare" },
    workplace_address: { region: "Stockholms län", country: "Sverige" },
  };
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

    const requestedUrl = fetchMock.mock.calls[0]?.[0];
    expect(requestedUrl).toBeInstanceOf(URL);
    expect((requestedUrl as URL).searchParams.get("worktime-extent")).toBe("947z_JGS_Uk2");
    expect((requestedUrl as URL).searchParams.has("working-hours-type")).toBe(false);
    expect((requestedUrl as URL).searchParams.get("country")).toBe("i46j_HmG_v64");
    expect((requestedUrl as URL).searchParams.getAll("occupation-name")).toEqual([
      "-NSEG_DmQ_waj",
      "-KJoL_2hp_Sa5",
      "-Vq8N_Qvz_i4u",
    ]);

    const requestOptions = fetchMock.mock.calls[0]?.[1] as { headers?: Record<string, string> };
    expect(requestOptions.headers?.["X-Fields"]).toContain("description{text}");
    expect(requestOptions.headers?.["X-Fields"]).toContain("working_hours_type{label}");
    expect(requestOptions.headers?.["X-Fields"]).not.toContain("text_formatted");
    expect(requestOptions.headers?.["X-Fields"]).not.toContain("application_details");
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
        total: { value: 2 },
        hits: [
          validAd({ id: "placeholder", headline: "Standard" }),
          validAd({ id: "real", headline: "Vi söker en Arbetsledare!" }),
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await searchJobs();

    expect(result.jobs.map((job) => job.id)).toEqual(["real"]);
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
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => validAd({ headline: "Standard" }),
      });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getJobById("123")).resolves.toBeNull();
    await expect(getJobById("124")).resolves.toBeNull();
    await expect(getCanonicalJobSlug("125")).resolves.toBeNull();
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
