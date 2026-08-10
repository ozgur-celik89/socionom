import { describe, expect, it, vi } from "vitest";
import type { JobSearchFilters } from "@/domain/jobs/types";

const cacheKeys = vi.hoisted(() => [] as string[]);

// Fångar strängen katalogen slår upp på, i stället för att skanna något.
vi.mock("next/cache", () => ({
  unstable_cache: () => async (serializedFilters: string) => {
    cacheKeys.push(serializedFilters);
    return { entries: [], truncated: false };
  },
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));

const { getJobCatalog } = await import("./catalog");

async function keyFor(filters: JobSearchFilters) {
  cacheKeys.length = 0;
  await getJobCatalog(filters);
  return cacheKeys.at(-1);
}

describe("getJobCatalog cache key", () => {
  it("treats an omitted remote as remote: false", async () => {
    // Startsidan utelämnar remote, /lediga-jobb skickar false. Utan
    // normalisering skannas samma sökning två gånger per revalidate-fönster.
    expect(await keyFor({ sort: "pubdate-desc" }))
      .toBe(await keyFor({ remote: false, sort: "pubdate-desc" }));
  });

  it("ignores paging, which never changes the underlying catalog", async () => {
    expect(await keyFor({ sort: "pubdate-desc", page: 4, pageSize: 6 }))
      .toBe(await keyFor({ sort: "pubdate-desc" }));
  });

  it("still separates searches that really differ", async () => {
    expect(await keyFor({ sort: "pubdate-desc", remote: true }))
      .not.toBe(await keyFor({ sort: "pubdate-desc", remote: false }));
    expect(await keyFor({ sort: "pubdate-desc", regionId: "CaRE_1nn_cSU" }))
      .not.toBe(await keyFor({ sort: "pubdate-desc" }));
  });

  it("keeps the key stable when the caller sets fields in another order", async () => {
    expect(await keyFor({ sort: "pubdate-desc", regionId: "CaRE_1nn_cSU", remote: false }))
      .toBe(await keyFor({ remote: false, regionId: "CaRE_1nn_cSU", sort: "pubdate-desc" }));
  });
});
