import { afterEach, describe, expect, it, vi } from "vitest";
import { getCanonicalJobSlug } from "./canonical";

function canonicalAd(overrides: Record<string, unknown> = {}) {
  return {
    headline: "Socialsekreterare till barn och unga",
    application_deadline: "2099-02-01T23:59:59",
    removed: false,
    occupation: { concept_id: "socialsekreterare" },
    occupation_group: { concept_id: "pok1_ipJ_yzD" },
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("canonical JobSearch lookup", () => {
  it("returns the canonical slug from a minimal response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ hits: [{ id: "123", ...canonicalAd() }] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCanonicalJobSlug("123")).resolves.toBe("socialsekreterare-till-barn-och-unga");

    const requestedUrl = fetchMock.mock.calls[0]?.[0] as URL;
    const options = fetchMock.mock.calls[0]?.[1] as { headers?: Record<string, string>; next?: unknown };
    expect(requestedUrl.pathname).toBe("/search");
    expect(requestedUrl.searchParams.get("q")).toBe("123");
    expect(options.headers?.["X-Fields"]).toContain("headline");
    expect(options.headers?.["X-Fields"]).toContain("occupation_group{concept_id}");
    expect(options.headers?.["X-Fields"]).not.toContain("description");
    expect(options.headers?.["x-feature-disable-smart-freetext"]).toBe("true");
    expect(options.next).toBeUndefined();
  });

  it("returns null for unavailable and irrelevant jobs", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          hits: [{
            id: "124",
            ...canonicalAd({ occupation_group: { concept_id: "other-group" } }),
          }],
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCanonicalJobSlug("123")).resolves.toBeNull();
    await expect(getCanonicalJobSlug("124")).resolves.toBeNull();
  });

  it("ignores a text-search hit with another ID", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ hits: [{ id: "999", ...canonicalAd() }] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCanonicalJobSlug("123")).resolves.toBeNull();
  });

  it("does not retry because the job page handles temporary failures", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network unavailable"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCanonicalJobSlug("123")).rejects.toThrow("network unavailable");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects malformed IDs without calling JobSearch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCanonicalJobSlug("not-a-number")).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
