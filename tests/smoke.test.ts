import { spawn, type ChildProcess } from "node:child_process";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Röktester mot ett riktigt produktionsbygge. Enhetstesterna täcker logiken;
 * det här svarar på den fråga de inte kan svara på – renderas sidan alls?
 * Assertionerna håller sig till sidans egen struktur, aldrig till annonsdata,
 * så ett API-avbrott hos Arbetsförmedlingen inte gör testerna röda.
 *
 * Kräver ett färdigt bygge: npm run build && npm run test:smoke
 */

const PORT = 3179;
const BASE = `http://127.0.0.1:${PORT}`;

let server: ChildProcess;

async function respondsOnPort() {
  try {
    await fetch(BASE, { signal: AbortSignal.timeout(2_000) });
    return true;
  } catch {
    return false;
  }
}

async function waitUntilReady(timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`next start avslutades med kod ${server.exitCode}.`);
    try {
      const response = await fetch(BASE, { signal: AbortSignal.timeout(5_000) });
      if (response.ok) return;
    } catch {
      // Servern har inte bundit porten än.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Servern svarade inte på ${BASE} inom ${timeoutMs} ms. Har du kört npm run build?`);
}

beforeAll(async () => {
  // En kvarlämnad server från en tidigare körning skulle behålla porten och
  // svara med ett gammalt bygge – testerna blir gröna eller röda av fel skäl.
  if (await respondsOnPort()) {
    throw new Error(`Port ${PORT} är upptagen. Stoppa processen som lyssnar där och kör om.`);
  }

  // Noden startas direkt i stället för via npx: annars blir barnprocessen ett
  // skal, och kill() lämnar servern vid liv.
  const nextBin = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  server = spawn(process.execPath, [nextBin, "start", "-p", String(PORT)], {
    stdio: "ignore",
    // next start startar en egen arbetarprocess. Utan egen processgrupp går den
    // inte att nå när testet ska städa upp.
    detached: process.platform !== "win32",
  });
  await waitUntilReady();
}, 120_000);

afterAll(async () => {
  if (!server?.pid || server.exitCode !== null) return;

  // Arbetarprocessen håller porten, så hela trädet måste ner – annars ärver
  // nästa körning en server som kör ett gammalt bygge.
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    process.kill(-server.pid, "SIGTERM");
  }

  for (let attempt = 0; attempt < 40 && await respondsOnPort(); attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  if (await respondsOnPort()) throw new Error(`Servern på port ${PORT} gick inte att stoppa.`);
});

describe("varje sidtyp renderar", () => {
  it.each([
    ["/", "Hitta nästa jobb som socionom"],
    ["/lediga-jobb", "Lediga jobb för socionomer"],
    ["/lediga-jobb/distans", "Socionomjobb på distans"],
    ["/lediga-jobb/yrke/socialsekreterare", "Lediga jobb som Socialsekreterare"],
    ["/lediga-jobb/yrke/socialsekreterare/skane", "Socialsekreterare-jobb i Skåne"],
    ["/lediga-jobb/ort/stockholm", "Lediga socionomjobb i Stockholm"],
    ["/om", "<h1>"],
    ["/annonsera", "Annonsera på socionom.se"],
    ["/kontakt", "<h1>"],
    ["/sa-valjer-vi-jobb", "<h1>"],
    ["/integritet", "<h1>"],
    ["/kakor", "<h1>"],
  ])("%s svarar 200 och innehåller sin rubrik", async (path, marker) => {
    const response = await fetch(`${BASE}${path}`);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain(marker);
  }, 90_000);

  it("skickar startsidans stabila innehåll före sidfoten", async () => {
    const html = await (await fetch(BASE)).text();
    const heroIndex = html.indexOf('class="home-hero"');
    const latestJobsIndex = html.indexOf("Senaste socionomjobben");
    const footerIndex = html.indexOf('class="site-footer"');

    expect(heroIndex).toBeGreaterThanOrEqual(0);
    expect(latestJobsIndex).toBeGreaterThan(heroIndex);
    expect(footerIndex).toBeGreaterThan(latestJobsIndex);
  }, 90_000);
});

describe("sökningen", () => {
  it("överlever filter i adressen och håller dem utanför indexet", async () => {
    const response = await fetch(`${BASE}/lediga-jobb?yrke=kurator&region=skane&distans=1`);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain("Lediga jobb för socionomer");
    expect(html).toContain('name="robots"');
    expect(html).toContain("noindex");
  }, 90_000);

  it("visar ett tomt tillstånd i stället för att krascha på nonsens", async () => {
    const response = await fetch(`${BASE}/lediga-jobb?q=zzzzqqqxyz`);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Lediga jobb för socionomer");
  }, 90_000);
});

describe("okända adresser", () => {
  it.each([
    "/lediga-jobb/yrke/finns-inte",
    "/lediga-jobb/ort/finns-inte",
    "/en-sida-som-inte-finns",
  ])("%s ger 404", async (path) => {
    const response = await fetch(`${BASE}${path}`);
    expect(response.status).toBe(404);
  }, 90_000);
});

describe("robots och sitemaps", () => {
  it("robots.txt pekar ut sitemapen", async () => {
    const response = await fetch(`${BASE}/robots.txt`);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Sitemap:");
  }, 30_000);

  it.each([
    ["/sitemap.xml", "<sitemapindex"],
    ["/sitemap-pages.xml", "<urlset"],
    ["/sitemap-landing.xml", "<urlset"],
    ["/sitemap-jobs.xml", "<urlset"],
  ])("%s är giltig XML", async (path, rootElement) => {
    const response = await fetch(`${BASE}${path}`);
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("xml");
    expect(body).toContain(rootElement);
  }, 90_000);

  it("indexet listar alla tre delsitemaps", async () => {
    const body = await (await fetch(`${BASE}/sitemap.xml`)).text();

    for (const path of ["sitemap-pages.xml", "sitemap-landing.xml", "sitemap-jobs.xml"]) {
      expect(body).toContain(path);
    }
  }, 30_000);
});

describe("en riktig annons", () => {
  async function firstJobPath() {
    const body = await (await fetch(`${BASE}/sitemap-jobs.xml`)).text();
    const location = body.match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (!location) throw new Error("Jobbsitemapen är tom – finns det några annonser att rendera?");
    return new URL(location).pathname;
  }

  it("renderar annonssidan med strukturerad data", async () => {
    const response = await fetch(`${BASE}${await firstJobPath()}`);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain('"@type":"JobPosting"');
    expect(html).toContain("Om jobbet");
  }, 90_000);

  it("flyttar en felaktig slug till den kanoniska med 308", async () => {
    const [, , id] = (await firstJobPath()).split("/");
    const response = await fetch(`${BASE}/lediga-jobb/${id}/fel-slug`, { redirect: "manual" });

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toContain(`/lediga-jobb/${id}/`);
    expect(response.headers.get("location")).not.toContain("fel-slug");
  }, 90_000);

  it("ger 404 för ett annons-id som inte finns", async () => {
    const response = await fetch(`${BASE}/lediga-jobb/99999999999/nagon-slug`);
    expect(response.status).toBe(404);
  }, 90_000);
});
