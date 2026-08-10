import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getCanonicalJobSlug = vi.hoisted(() => vi.fn());

vi.mock("@/integrations/jobtech/canonical", () => ({ getCanonicalJobSlug }));

import { proxy } from "./proxy";

beforeEach(() => {
  getCanonicalJobSlug.mockReset();
});

describe("job slug proxy", () => {
  it("returns a permanent HTTP redirect for an outdated slug", async () => {
    getCanonicalJobSlug.mockResolvedValue("korrekt-slug");

    const response = await proxy(new NextRequest("https://socionom.se/lediga-jobb/123/fel-slug?spårning=1"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://socionom.se/lediga-jobb/123/korrekt-slug");
  });

  it("continues normally for the canonical slug", async () => {
    getCanonicalJobSlug.mockResolvedValue("korrekt-slug");

    const response = await proxy(new NextRequest("https://socionom.se/lediga-jobb/123/korrekt-slug"));

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("returns the not-found page with HTTP 404 when the job is unavailable", async () => {
    getCanonicalJobSlug.mockResolvedValue(null);

    const response = await proxy(new NextRequest("https://socionom.se/lediga-jobb/123/inaktuellt-jobb"));

    expect(response.status).toBe(404);
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://socionom.se/_not-found");
  });

  it("does not call JobSearch for occupation and region landing pages", async () => {
    await proxy(new NextRequest("https://socionom.se/lediga-jobb/yrke/kurator"));
    await proxy(new NextRequest("https://socionom.se/lediga-jobb/ort/uppsala"));

    expect(getCanonicalJobSlug).not.toHaveBeenCalled();
  });

  it.each([
    "/lediga-jobb/yrke/finns-inte",
    "/lediga-jobb/yrke/finns-inte/skane",
    "/lediga-jobb/yrke/kurator/finns-inte",
    "/lediga-jobb/ort/finns-inte",
  ])("returns HTTP 404 for the unknown landing page %s", async (path) => {
    // Sidans egen notFound() hinner inte sätta statuskoden när svaret redan
    // strömmar, så en okänd slug skulle annars bli en mjuk 404.
    const response = await proxy(new NextRequest(`https://socionom.se${path}`));

    expect(response.status).toBe(404);
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://socionom.se/_not-found");
    expect(getCanonicalJobSlug).not.toHaveBeenCalled();
  });

  it.each([
    "/lediga-jobb/yrke/kurator",
    "/lediga-jobb/yrke/kurator/skane",
    "/lediga-jobb/ort/uppsala",
  ])("lets the known landing page %s through", async (path) => {
    const response = await proxy(new NextRequest(`https://socionom.se${path}`));

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("leaves an unknown slug to the page during client navigation", async () => {
    const response = await proxy(new NextRequest(
      "https://socionom.se/lediga-jobb/yrke/finns-inte",
      { headers: { rsc: "1" } },
    ));

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it.each([
    ["an RSC navigation", { rsc: "1" }],
    ["a route prefetch", { "next-router-prefetch": "1" }],
    ["a segment prefetch", { "next-router-segment-prefetch": "/_tree" }],
    ["a browser prefetch", { purpose: "prefetch" }],
  ])("skips the canonical lookup for %s", async (_label, headers) => {
    const response = await proxy(new NextRequest(
      "https://socionom.se/lediga-jobb/123/korrekt-slug",
      { headers },
    ));

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(getCanonicalJobSlug).not.toHaveBeenCalled();
  });
});
