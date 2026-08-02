# Projektinstruktioner för socionom.se

## Obligatorisk projektkontext

- Läs alltid `ARKITEKTUR.md` innan arkitektur, teknikval, datakällor, routing, SEO eller projektstruktur ändras.
- Läs alltid `DESIGN.md` innan gränssnitt, färger, typografi, komponenter, layout eller tonalitet ändras.
- Läs alltid `SEO.md` innan routing, metadata, strukturerad data, indexering, sitemap, robots.txt, intern länkning eller innehållsstruktur ändras.
- Läs alltid `MVP.md` innan funktioner, sidor, API-integration eller användarflöden implementeras eller ändras.
- Läs alltid `LANSERING.md` inför driftsättning, produktionskonfiguration eller lanseringskontroll.
- Följ dokumentens beslut om teknik, färger, typografi, tillgänglighet, komponenter, SEO och MVP-omfattning.

## Genomförande

- Bygg den första versionen utan databas och utan en separat backend.
- Använd Next.js med TypeScript.
- Hämta jobb från Arbetsförmedlingens JobSearch API på serversidan.
- Isolera JobSearch-integrationen bakom ett eget datalager och mappa API-svaren till projektets normaliserade jobbformat.
- Använd serverrendering och cache där det förbättrar SEO, prestanda och stabilitet.
- Sanera externt HTML-innehåll innan det visas.
- Lägg endast `JobPosting`-data på individuella, aktiva jobbsidor och låt innehållet överensstämma med vad användaren ser.
- Indexera endast redaktionellt valda yrkes- och ortssidor; tillfälliga sökningar och godtyckliga filterkombinationer ska normalt inte indexeras.
- Håll sitemap, canonical-URL:er och hantering av utgångna jobb korrekta enligt `SEO.md`.
- Prioritera mobile-first, tillgänglighet och tydliga sök- och filterflöden.
- Håll implementationen inom omfattningen i `MVP.md`; funktioner som uttryckligen ligger utanför MVP ska inte byggas utan nytt beslut.

## Ändringar av besluten

- Gör inte större avsteg från `ARKITEKTUR.md`, `DESIGN.md`, `SEO.md` eller `MVP.md` utan att tydligt uppmärksamma användaren på avsteget och förklara varför det behövs.
- När ett arkitektur-, design-, SEO- eller omfattningsbeslut ändras avsiktligt ska motsvarande Markdown-dokument uppdateras så att dokumentationen fortsätter vara korrekt.
