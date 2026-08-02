import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getCanonicalJobSlug = vi.hoisted(() => vi.fn());

vi.mock("@/integrations/jobtech/search", () => ({ getCanonicalJobSlug }));

import { proxy } from "./proxy";

beforeEach(() => {
  getCanonicalJobSlug.mockReset();
});

describe("job slug proxy", () => {
  it("returns a permanent HTTP redirect for an outdated slug", async () => {
    getCanonicalJobSlug.mockResolvedValue("korrekt-slug");

    const response = await proxy(new NextRequest("https://socionom.se/jobb/123/fel-slug?spårning=1"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://socionom.se/jobb/123/korrekt-slug");
  });

  it("continues normally for the canonical slug", async () => {
    getCanonicalJobSlug.mockResolvedValue("korrekt-slug");

    const response = await proxy(new NextRequest("https://socionom.se/jobb/123/korrekt-slug"));

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("returns the not-found page with HTTP 404 when the job is unavailable", async () => {
    getCanonicalJobSlug.mockResolvedValue(null);

    const response = await proxy(new NextRequest("https://socionom.se/jobb/123/inaktuellt-jobb"));

    expect(response.status).toBe(404);
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://socionom.se/_not-found");
  });

  it("does not call JobSearch for occupation and region landing pages", async () => {
    await proxy(new NextRequest("https://socionom.se/jobb/yrke/kurator"));
    await proxy(new NextRequest("https://socionom.se/jobb/ort/uppsala"));

    expect(getCanonicalJobSlug).not.toHaveBeenCalled();
  });
});
