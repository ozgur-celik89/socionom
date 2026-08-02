# MVP-specifikation för socionom.se

## Status

Detta dokument definierar den första lanseringsbara versionen av socionom.se. Det är den styrande omfattningen för implementationen.

MVP:n ska vara liten nog att lansera snabbt men komplett nog att:

- hjälpa socionomer att hitta relevanta jobb
- ge Google indexerbara och korrekta jobbsidor
- mäta om tjänsten skapar trafik och ansökningsklick
- skapa en första kontaktväg för arbetsgivare
- kunna byggas vidare med databas och egna annonser senare

## Produktmål

Socionom.se ska vara den enklaste specialiserade platsen för att hitta aktuella och relevanta socionomjobb i Sverige.

### Värdelöfte

> Samlade och relevanta socionomjobb från hela Sverige – enkelt att söka, filtrera och ansöka till.

### Primär målgrupp

- utbildade socionomer
- socionomstudenter nära examen
- personer som arbetar inom socialt arbete och söker en roll där socionomkompetens efterfrågas

### Sekundär målgrupp

- kommuner, regioner och myndigheter
- privata vård- och omsorgsaktörer
- ideella organisationer
- rekryterings- och bemanningsföretag

## Framgångsmått

Det primära produktmåttet är:

> Antal kvalificerade klick från socionom.se till en jobbansökan.

Sekundära mått:

- organiska visningar och klick
- antal besök på individuella jobb
- andel jobbvisningar som leder till klick på `Ansök`
- genomförda sökningar
- sökningar utan resultat
- mest använda yrkes- och ortsfilter
- klick och kontaktförfrågningar från sidan `Annonsera`

Råa sidvisningar är inte tillräckligt som framgångsmått.

## Omfattning

### Ingår i MVP

- startsida med jobbsökning
- serverrenderad jobblista
- fritextsökning
- filter för yrkesroll
- filter för län eller region
- filter för anställningsform när källdatan stödjer det
- filter för distansarbete när källdatan stödjer det
- pagination
- individuella serverrenderade jobbsidor
- länkar vidare till den riktiga ansökningssidan
- redaktionellt valda yrkessidor
- redaktionellt valda orts- och regionsidor
- informationssidor
- responsiv mobile-first-design
- tillgänglig grundimplementation
- metadata, canonical, sitemap och robots.txt
- `JobPosting` på aktiva individuella jobb
- felhantering för tomma resultat och otillgängligt API
- integritetsvänlig grundanalys
- grundläggande felövervakning

### Ingår inte i MVP

- egen databas
- separat backendapplikation
- användarkonton
- sparade jobb
- jobbevakningar via e-post
- egna jobbannonser
- sponsrade jobb
- betalningar
- arbetsgivarportal
- CV-uppladdning
- ansökningar direkt på socionom.se
- kandidatprofiler
- personalisering
- fullskaligt CMS
- automatisk AI-klassificering
- Indexing API

Funktioner utanför MVP ska inte implementeras i förväg. Arkitekturen får förbereda tydliga gränser för dem men ska inte bära deras komplexitet.

## Sidkarta

### Publika sidor

```text
/
/jobb
/jobb/[id]/[slug]
/jobb/yrke/[yrkesroll]
/jobb/ort/[region]
/jobb/yrke/[yrkesroll]/[region]
/jobb/distans
/om
/sa-valjer-vi-jobb
/kontakt
/annonsera
/integritet
/kakor
```

### Tekniska sidor och resurser

```text
/robots.txt
/sitemap.xml
/sitemap-jobs.xml
/sitemap-pages.xml
/manifest.webmanifest
```

### Systemtillstånd

- anpassad `404`
- utgånget eller borttaget jobb
- tomt sökresultat
- tillfälligt API-fel
- laddningstillstånd för klientstyrda filter

## Startsidan

### Syfte

Startsidan ska omedelbart förklara tjänsten och leda till en relevant jobbsökning.

### Innehållsordning

1. Sidhuvud och navigation.
2. Hero med rubrik, ingress och sökfält.
3. Populära yrkesområden.
4. Senaste relevanta jobben.
5. Jobb per prioriterad region.
6. Kort sektion för arbetsgivare.
7. Förklarande sektion om datakällan.
8. Sidfot med informations- och juridiklänkar.

### Grundcopy

```text
H1: Hitta nästa jobb som socionom

Ingress: Samlade socionomjobb från hela Sverige – enkelt att söka, filtrera och ansöka till.

Primär knapp: Sök jobb
Sekundär arbetsgivarlänk: Annonsera på socionom.se
```

### Acceptanskriterier

- Jobbsökningen fungerar med tangentbord och skärmläsare.
- Senaste jobben hämtas server-side.
- Sidan fungerar begripligt även om API:t tillfälligt inte svarar.
- Sidan har korrekt titel, metabeskrivning och canonical.
- Ingen stor eller renderingsblockerande hero-bild används.

## Jobblistan

### URL

```text
/jobb?q=&yrke=&region=&anstallning=&distans=&sida=
```

### Funktioner

- fritextsökning
- kombinerbara filter
- tydlig återställning av filter
- antal resultat
- pagination med stabila URL-parametrar
- jobbkorten visar kärninformation
- tomt läge föreslår bredare sökning eller närliggande kategorier

### Sortering

Standard är relevans med publiceringsdatum som sekundär signal. Om JobSearch inte ger tillräcklig kontroll används API:ts rekommenderade relevanssortering. Användaren kan få valet `Senast publicerade` om det kan implementeras utan att skapa förvirrande resultat.

### Indexering

- Den rena sidan `/jobb` får indexeras.
- Fritextsökningar och godtyckliga filterkombinationer får `noindex`.
- Redaktionella yrkes- och ortssidor har egna rena URL:er och får indexeras enligt `SEO.md`.

## Jobbkort

Varje kort visar när datan finns:

- jobbtitel
- arbetsgivare
- ort eller distans
- anställningsform
- omfattning
- publiceringsdatum
- sista ansökningsdag
- källa

Kortet ska ha en tydlig länk till den interna jobbsidan. Hela kortet får vara klickbart om semantik, tangentbordsstöd och textmarkering fortfarande fungerar korrekt.

Etiketten `Nytt` används för jobb som publicerats inom en konfigurerbar kort period. Den ska ha puderrosa bakgrund och mörk gammelrosa text enligt `DESIGN.md`.

## Individuell jobbsida

### URL

```text
/jobb/[id]/[slug]
```

### Innehåll

- breadcrumbs
- jobbtitel som H1
- arbetsgivare
- ort eller orter
- publiceringsdatum
- sista ansökningsdag
- anställningsform och omfattning
- distansinformation
- fullständig sanerad beskrivning
- tydlig primär knapp `Ansök`
- information om att ansökan sker på extern webbplats
- källa Arbetsförmedlingen
- relaterade aktiva jobb

### Beteende

- ID används för uppslag i JobSearch.
- Slug beräknas från den aktuella titeln.
- Fel slug omdirigeras permanent till aktuell canonical-URL.
- Om jobbet saknas eller inte längre är aktivt returneras `404` eller `410` utan `JobPosting`.
- Externa ansökningslänkar valideras och får endast använda tillåtna protokoll.

### Acceptanskriterier

- Sidans huvudinnehåll finns i serverrenderad HTML.
- HTML från annonsen är sanerad.
- Synligt innehåll och JSON-LD överensstämmer.
- `JobPosting` validerar i Googles Rich Results Test för kompletta annonser.
- Sidan går att använda helt med tangentbord.

## Yrkesurval

### Första redaktionella kategorier

1. Socialsekreterare
2. Kurator
3. Skolkurator
4. Biståndshandläggare
5. LSS-handläggare
6. Familjebehandlare
7. Behandlingsassistent

Kategorierna relaterar huvudsakligen till SSYK-grupperna:

- `2661` Socialsekreterare
- `2662` Kuratorer
- `2663` Biståndsbedömare m.fl.
- `2669` Övriga yrken inom socialt arbete

SSYK-koderna är underlag, inte nödvändigtvis de värden som skickas till JobSearch. Aktuella JobTech concept IDs ska verifieras mot JobTech Taxonomy innan implementationen låses.

### Sekundära kandidater

Följande roller kan läggas till efter manuell relevanskontroll:

- socialpedagog
- familjehemssekreterare
- familjerättssekreterare
- fältsekreterare
- frivårdsinspektör
- behandlingspedagog
- socialkonsulent
- arbetsledare eller chef inom socialt arbete

De ska inte automatiskt inkluderas enbart på titel eftersom utbildningskraven varierar.

### Relevansregler

Ett jobb kan inkluderas när minst ett av följande gäller:

- det har en verifierad relevant JobTech-yrkeskod
- annonsen anger socionomexamen som krav eller tydligt meriterande
- titel och beskrivning matchar en manuellt godkänd kombination av regler

Ett jobb ska kunna exkluderas när:

- yrkestiteln har en annan betydelse
- annonsen uppenbart riktar sig till en annan yrkesgrupp
- den endast avser praktik, examensarbete eller utbildningsplats och detta inte är en avsiktlig kategori
- annonsen saknar tillräcklig information för en riktig ansökan

### Kvalitetskontroll

Före lansering ska minst 200 representativa sökresultat granskas manuellt och klassas som relevanta eller irrelevanta. Reglerna justeras tills resultatet är tillräckligt träffsäkert för att inge förtroende.

## Geografiskt urval

MVP:n stödjer filtrering på hela Sverige och län/region. Följande redaktionella sidor prioriteras initialt om de har ett stabilt jobbutbud:

- Stockholm
- Västra Götaland
- Skåne
- Uppsala
- Östergötland
- Jönköping
- Örebro
- Västerbotten

Kommunbaserade SEO-sidor skapas inte automatiskt. De kan läggas till efter lansering baserat på jobbutbud och Search Console-data.

## Datakälla och integration

### Källa

MVP:n använder Arbetsförmedlingens JobSearch API.

### Principer

- API-anrop görs från Next.js på serversidan.
- Webbläsaren anropar inte JobSearch direkt för den initiala renderingen.
- Integrationen isoleras i `src/integrations/jobtech/`.
- API-modeller exponeras inte direkt för UI-komponenter.
- Alla svar mappas till ett internt domänformat.
- API-anrop använder timeout, kontrollerad retry och cache.
- Samma sökning ska återanvända cache.
- API-fel ska inte exponera tekniska detaljer för besökaren.

### Normaliserad jobbmodell

```ts
type Job = {
  id: string;
  source: "arbetsformedlingen";
  slug: string;
  title: string;
  descriptionHtml: string;
  employerName: string;
  locations: Array<{
    municipality?: string;
    region?: string;
    country: string;
  }>;
  occupationConceptIds: string[];
  employmentType?: string;
  scope?: string;
  remote: boolean;
  publishedAt: string;
  expiresAt?: string;
  applyUrl: string;
  sourceUrl?: string;
  sourceUpdatedAt?: string;
};
```

Modellen får utökas när verkliga API-svar visar att fler fält behövs, men UI:t ska inte kopplas direkt till JobSearch JSON-struktur.

### Cache

Utgångspunkt:

- sökresultat: återvalidering efter `5–15 minuter`
- jobbsidor: återvalidering efter `15–60 minuter`
- sitemap: cachad och återvaliderad enligt en separat längre men rimlig period

Exakta tider justeras efter API-beteende och behovet att ta bort utgångna jobb snabbt.

## Designkrav

Implementation ska följa `DESIGN.md`.

Grundval:

- Manrope
- skogsgrönt `#185A4A`
- vit sidbakgrund `#FFFFFF`
- mörkgrön navigation och footer `#143F35`
- puderrosa `#F4DCE5`
- mobile-first
- tunna kantlinjer och diskreta skuggor
- tydliga fokusmarkeringar
- minst 16 pixlars brödtext

Använd ingen stor stockbild i hero-sektionen. En ordlogotyp räcker för MVP.

## SEO-krav

Implementation ska följa `SEO.md`.

MVP måste innehålla:

- serverrenderade indexerbara sidor
- unik metadata per sidtyp
- canonical-URL:er
- `JobPosting` på aktiva individuella jobb
- `BreadcrumbList` där breadcrumbs visas
- `Organization` på lämplig övergripande sida
- sitemap med aktiva jobb
- robots.txt
- `noindex` på tillfälliga sök- och filtersidor
- korrekt hantering av utgångna jobb

## Analys

Standardvalet för MVP är Vercel Web Analytics eftersom driften redan planeras på Vercel och tjänsten kan användas utan analyskakor.

Regler:

- skicka aldrig e-postadress, fritextsökning eller annan möjlig personuppgift i event-egenskaper
- filtrera bort känsliga URL-parametrar
- dokumentera analysen i integritetspolicyn
- aktivera inga marknadsförings- eller beteendespårningsverktyg i MVP

Om plan och funktionalitet tillåter ska följande aggregerade händelser mätas utan användaridentifierare:

- `job_search`
- `job_apply_click`
- `employer_contact_click`
- `filter_used`
- `zero_results`

## Informations- och juridiksidor

### Om

Ska förklara:

- vem tjänsten är till för
- varför den finns
- vem som driver den
- att socionom.se är en fristående tjänst

### Så väljer vi jobb

Ska förklara:

- datakällan
- hur relevanta roller väljs
- att fel kan förekomma
- hur felaktiga eller inaktuella annonser rapporteras

### Kontakt

Ska visa fungerande kontaktväg och, när tillgängligt:

- juridiskt namn
- organisationsnummer
- fysisk eller postadress
- e-postadress
- telefonnummer om verksamhetens form eller försäljning kräver det

### Integritet

Ska beskriva:

- personuppgiftsansvarig
- behandlade uppgifter
- ändamål och rättslig grund
- mottagare och leverantörer
- lagringstid
- eventuella tredjelandsöverföringar
- användarens rättigheter
- kontaktväg

### Kakor

Ska beskriva om webbplatsen använder kakor eller liknande teknik. I MVP används inga icke-nödvändiga kakor. Om detta ändras krävs ny juridisk och teknisk bedömning innan verktyget aktiveras.

### Annonsera

MVP-sidan ska validera efterfrågan, inte sälja automatiskt.

```text
H1: Nå Sveriges socionomer

Copy: Vill ni annonsera en tjänst för socionomer på socionom.se? Kontakta oss för att anmäla intresse och påverka hur erbjudandet utformas.

CTA: Kontakta oss om annonsering
```

Ingen prislista eller beställningsfunktion krävs i MVP.

## Tillgänglighetskrav

- semantisk HTML
- logisk rubrikhierarki
- full tangentbordsnavigering
- synlig fokusmarkering
- korrekta etiketter och felmeddelanden i formulär
- tillräcklig färgkontrast
- status kommuniceras inte enbart med färg
- klickytor dimensioneras för mobil
- stöd för 200 procent zoom utan förlust av funktion
- `prefers-reduced-motion` respekteras
- automatisk och manuell tillgänglighetstestning inför lansering

## Säkerhetskrav

- sanera extern HTML med en explicit allowlist
- tillåt endast säkra protokoll i externa länkar
- använd säkerhetsheaders inklusive en genomtänkt Content Security Policy
- exponera inte hemligheter i klientkod
- validera alla URL-parametrar
- begränsa längd på fritextsökningar
- logga inte onödiga personuppgifter
- håll beroenden uppdaterade
- visa inte råa API-fel eller stack traces för användare

## Prestandakrav

Mål för verkliga användare vid 75:e percentilen:

- LCP högst `2,5 sekunder`
- INP högst `200 millisekunder`
- CLS högst `0,1`

MVP:n ska undvika stora bilder, onödigt klient-JavaScript och layoutförskjutningar.

## Testkrav

### Automatiska tester

- mappning från JobSearch-data till `Job`
- saknade och ofullständiga API-fält
- slug-generering
- URL- och parameter-validering
- HTML-sanering
- `JobPosting`-generering
- metadata-generering
- relevansregler där de är deterministiska

### Integrationstester

- sökning med filter
- pagination
- individuell annons
- borttagen annons
- timeout och API-fel
- sitemap innehåller endast giltiga typer av URL:er

### Manuell kontroll

- mobil, surfplatta och desktop
- Chrome, Safari, Firefox och Edge i rimlig omfattning
- tangentbord
- skärmläsarens grundflöde
- färgkontrast
- Rich Results Test
- canonical och robots
- externa ansökningslänkar

## Definition of Done

MVP:n är redo för lansering när:

- alla sidor i omfattningen fungerar i produktion
- relevansgranskningen är genomförd
- inga kritiska tillgänglighetsfel finns
- inga kända XSS- eller länkvalideringsproblem finns
- API-fel hanteras begripligt
- metadata, canonical, sitemap och robots är verifierade
- strukturerad data validerar
- juridiska kontaktuppgifter och integritetstext är ifyllda
- produktionsdomänen och omdirigeringar fungerar
- Search Console är ansluten
- felövervakning är aktiv
- lanseringskontrollen i `LANSERING.md` är genomförd

## Öppna uppgifter som kräver verifiering

Följande är implementeringsuppgifter, inte skäl att utöka MVP:n:

- verifiera aktuella JobTech concept IDs för valda yrkesroller
- granska minst 200 jobb för relevans
- fyll i juridiskt namn och kontaktuppgifter
- bestäm slutlig e-postleverantör och skapa domänadresser
- kontrollera aktuell Vercel-konfiguration för analys, loggar och dataskydd
- kontrollera om särskilda tillgänglighetskrav gäller verksamhetens juridiska form och framtida försäljningsflöde
