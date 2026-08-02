# socionom.se

Socionom.se är en nischad jobbsajt för socionomer och närliggande roller inom socialt arbete i Sverige.

Den första versionen byggs som en Next.js-applikation som hämtar aktuella annonser server-side från Arbetsförmedlingens JobSearch API. MVP:n använder ingen egen databas och ingen separat backend.

## Projektstatus

Den första fungerande MVP:n är implementerad. Den innehåller startsida, jobbsökning, filter, pagination, yrkes- och regionsidor, individuella jobbannonser, informationssidor och teknisk SEO. Jobb hämtas från Arbetsförmedlingens JobSearch API utan egen databas.

## Starta lokalt

Krav: Node.js 20.9 eller senare.

```bash
npm install
npm run dev
```

Öppna sedan `http://localhost:3000`.

## Kvalitetskontroller

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

Kopiera `.env.example` till `.env.local` om webbplatsen ska köras med en annan publik basadress än `https://socionom.se`. Sentry aktiveras först när dess DSN-variabler fylls i. En auth-token, organisation och projekt behövs endast för uppladdning av sourcemaps vid produktionsbygget.

## Relevansgranskning

Skapa ett tabseparerat underlag med upp till 200 aktuella annonser:

```powershell
npm run audit:relevance > relevansgranskning.tsv
```

Öppna filen i ett kalkylprogram och fyll i kolumnerna `bedomning_relevant_ja_nej_osaker` och `kommentar`. Underlaget innehåller enkla varningssignaler som stöd, men varje annons ska fortfarande bedömas manuellt.

Den nytillagda gruppen behandlingsassistenter och socialpedagoger kan granskas separat:

```powershell
npm run audit:relevance:treatment > relevansgranskning-behandling.tsv
```

## Styrande dokument

Läs dokumenten i denna ordning:

1. [`AGENTS.md`](./AGENTS.md) – instruktioner för AI-agenter och implementation.
2. [`MVP.md`](./MVP.md) – funktioner, sidor, avgränsningar och acceptanskriterier.
3. [`ARKITEKTUR.md`](./ARKITEKTUR.md) – teknik, datakälla och framtida utveckling.
4. [`DESIGN.md`](./DESIGN.md) – färger, typografi, komponenter och tonalitet.
5. [`SEO.md`](./SEO.md) – routing, metadata, strukturerad data och indexering.
6. [`LANSERING.md`](./LANSERING.md) – operativ kontroll före och efter lansering.

Vid avsiktliga beslut som ändrar projektets omfattning, arkitektur, design eller SEO ska motsvarande dokument uppdateras samtidigt.

## Beslutad MVP

- Next.js med TypeScript
- server-side-anrop till JobSearch
- normaliserat internt jobbformat
- sökning, filter och pagination
- individuella jobbsidor
- utvalda yrkes- och ortssidor
- `JobPosting`, sitemap, canonical och robots.txt
- mobile-first och tillgänglig design
- Vercel för drift
- Vercel Web Analytics utan analyskakor

Följande ingår inte i MVP:

- databas
- användarkonton
- jobbmejl
- egna eller sponsrade annonser
- betalningar
- arbetsgivarportal
- CV eller ansökningar på socionom.se

## Kvar före publik lansering

1. Granska minst 200 hämtade jobb för relevans och justera filtren vid behov.
2. Fyll i riktiga juridiska ägar- och kontaktuppgifter.
3. Koppla domänen till Vercel och verifiera DNS, HTTPS och e-postadresser.
4. Lägg sajten i Google Search Console och skicka in `https://socionom.se/sitemap.xml`.
5. Genomför hela checklistan i `LANSERING.md`.
