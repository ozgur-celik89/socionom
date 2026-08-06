# Arkitektur för socionom.se

## Sammanfattning

För den första versionen av socionom.se behövs varken en databas eller en separat backend. Webbplatsen kan byggas som en Next.js-applikation som hämtar aktuella jobb direkt från Arbetsförmedlingens JobSearch API.

Det viktiga är att anropen i första hand görs på serversidan i Next.js, inte direkt från besökarens webbläsare. Då kan jobbsidorna serverrenderas, cachas och bli lättare för sökmotorer att indexera.

```text
Besökare
    │
    ▼
Next.js på Vercel
  - serverrendering
  - cache
  - sök och filter
  - SEO och JobPosting-data
    │
    ▼
Arbetsförmedlingens JobSearch API
```

Next.js innehåller viss serverfunktionalitet, men det behövs ingen separat backendapplikation att utveckla eller drifta.

## Rekommenderad teknik i första versionen

- Next.js med TypeScript
- Vercel för drift och CDN
- Tailwind CSS för gränssnittet
- Arbetsförmedlingens JobSearch API som datakälla
- Next.js inbyggda `fetch`-cache och återvalidering
- Sentry för felövervakning
- Enkel integritetsvänlig besöksstatistik

PostgreSQL, betalningar, arbetsgivarkonton och köhantering kan vänta tills de faktiskt behövs.

## Varför API-anropen bör göras server-side

Det är tekniskt möjligt att låta besökarens webbläsare anropa Arbetsförmedlingen direkt, men server-side-anrop är bättre eftersom:

- jobbens innehåll finns i den HTML som skickas till Google
- webbplatsen blir mindre beroende av webbläsarens CORS-regler
- API-svaren kan cachas centralt
- fel och tidsgränser kan hanteras på ett enhetligt sätt
- implementationen kan senare byta till en egen databas utan att gränssnittet behöver göras om

Detta är fortfarande en lösning utan egen databas och utan en separat backend.

## Använd JobSearch i första versionen

JobSearch passar bra när webbplatsen ska göra sökningar och hämta ett begränsat antal matchande annonser. Arbetsförmedlingen beskriver JobStream som alternativet för den som vill lagra och hålla en egen kopia av annonserna uppdaterad.

I första versionen kan socionom.se därför använda JobSearch för:

- fritextsökning
- filtrering på yrke
- filtrering på län och kommun
- distansarbete
- anställningsform
- hämtning av en individuell annons

Källor:

- [JobSearch](https://data.jobtechdev.se/dataservice/jobsearch/)
- [Arbetsförmedlingens platsannonsdata](https://data.jobtechdev.se/dataset/job-ads/)

## Urvalet av socionomjobb

Sök inte enbart efter ordet `socionom`. Många relevanta tjänster använder andra titlar, exempelvis:

- socialsekreterare
- kurator
- biståndshandläggare
- familjebehandlare
- behandlingsassistent
- LSS-handläggare
- skolkurator

Webbplatsen bör ha en konfigurationsfil med relevanta yrkeskoder från JobTech Taxonomy samt eventuella inkluderande och exkluderande sökord. Denna konfiguration kan ligga direkt i koden i början och kräver ingen databas.

## Sidor i första versionen

Föreslagen struktur:

```text
/
/lediga-jobb
/lediga-jobb/[id]/[slug]
/lediga-jobb/yrke/socialsekreterare
/lediga-jobb/yrke/kurator
/lediga-jobb/ort/stockholm
/lediga-jobb/ort/goteborg
/lediga-jobb/distans
/om
/kontakt
/annonsera
```

Varje individuell jobbannons ska ha en stabil URL baserad på Arbetsförmedlingens annons-ID. Ett exempel är:

```text
/lediga-jobb/12345678/socialsekreterare-till-stockholms-stad
```

ID:t är den beständiga delen. Sluggen är till för människor och sökmotorer.

Yrkes- och ortssidor ligger under egna statiska URL-grenar (`/lediga-jobb/yrke/` och `/lediga-jobb/ort/`). Det undviker routingkrockar med individuella jobbannonser och gör sidtypen tydlig.

Den tidigare URL-grenen `/jobb` omdirigeras permanent, sida för sida, till motsvarande adress under `/lediga-jobb`. Den gamla grenen ska inte generera egna canonical-URL:er eller förekomma i sitemap.

## Cache och tillgänglighet

När ingen egen databas finns blir webbplatsen beroende av att Arbetsförmedlingens API fungerar. Next.js-cachen minskar den risken.

En rimlig start är:

- cache av sökresultat i 5–15 minuter
- cache av jobbsidor i 15–60 minuter
- kort timeout och ett begripligt felmeddelande om API:t inte svarar
- automatisk återvalidering av cachat innehåll

Utgångna eller borttagna jobb ska inte fortsätta visas som sökbara. Om API:t inte längre returnerar en annons bör jobbsidan visa att jobbet är avslutat, ta bort `JobPosting`-datan och länka vidare till liknande aktiva jobb.

## SEO

Varje aktiv jobbannons bör serverrenderas och innehålla strukturerad data av typen `JobPosting`. Strukturerad data ska bara finnas på den individuella sidan för ett verkligt och aktivt jobb, inte på sök- eller listsidor.

Webbplatsen bör även ha:

- unika sidtitlar och metabeskrivningar
- canonical-URL:er
- sitemap
- robots.txt
- tydlig information om arbetsgivare, ort och sista ansökningsdag
- länk till den riktiga ansökningssidan

Google kräver att utgångna jobb tas bort eller markeras korrekt och rekommenderar Indexing API för snabbare uppdatering av jobbannonser. Se [Googles dokumentation om JobPosting](https://developers.google.com/search/docs/appearance/structured-data/job-posting).

## Säkerhet

Annonsbeskrivningar är externt innehåll. HTML från API:t måste därför saneras innan den visas för att förhindra XSS och trasig layout.

Webbplatsen ska genom sidfoten och informationssidorna vara tydlig med att annonserna kommer från Arbetsförmedlingens öppna data och får inte ge intryck av att socionom.se är en del av eller officiellt godkänd av Arbetsförmedlingen. Informationen behöver inte upprepas på varje jobbkort eller individuell jobbsida.

## När behövs en databas?

En databas bör läggas till först när minst ett av följande blir aktuellt:

- egna jobbannonser
- sponsrade placeringar
- betalningar och orderhistorik
- arbetsgivarkonton
- jobbmejl och sparade sökningar
- redaktionell granskning
- statistik per arbetsgivare
- behov av att webbplatsen fungerar oberoende av JobSearch API

När det händer är den naturliga uppgraderingen PostgreSQL och JobStream.

```text
Arbetsförmedlingen JobStream
            │
      schemalagd synkning
            │
            ▼
        PostgreSQL ◄──── Egna annonser och betalningar
            │
            ▼
          Next.js
```

JobStream skickar information om nya, uppdaterade och borttagna annonser och är gjort för tjänster som vill hålla en egen lokal kopia uppdaterad.

## Förbered för framtiden utan att bygga den nu

Även utan databas bör koden använda ett internt, normaliserat jobbformat. Arbetsförmedlingens API-data översätts till detta format i ett separat datalager innan den skickas till gränssnittet.

Exempel:

```ts
type Job = {
  id: string;
  source: "arbetsformedlingen" | "direct";
  title: string;
  description: string;
  employerName: string;
  locations: string[];
  publishedAt: string;
  expiresAt?: string;
  applyUrl: string;
};
```

Gränssnittet arbetar då mot typen `Job`, inte direkt mot Arbetsförmedlingens JSON-struktur. När databasen införs kan datakällan bytas utan att alla sidkomponenter behöver skrivas om.

En lämplig kodstruktur är:

```text
src/
  app/                  # Sidor och routing
  components/           # Gränssnitt
  features/jobs/        # Jobbsökning och presentation
  integrations/jobtech/ # Anrop och mappning av API-data
  domain/jobs/          # Egna typer och regler
  config/               # Yrkesroller och filter
```

## Rekommenderad utvecklingsordning

### Fas 1 – utan databas

- JobSearch API
- serverrenderade jobbsidor
- sökning och filter
- relevanta orts- och yrkessidor
- cache
- `JobPosting`-data och sitemap
- analys av trafik och populära sökningar

### Fas 2 – enkel kommersiell funktion

- PostgreSQL
- admin för egna annonser
- manuell fakturering eller Stripe
- sponsrade annonser, tydligt märkta
- JobStream-synkning

### Fas 3 – självbetjäning

- arbetsgivarkonton
- publicera och redigera annonser
- annonspaket och abonnemang
- jobbmejl
- statistik för arbetsgivare
- eventuella integrationer med rekryteringssystem

## Slutsats

Den bästa starten är en enda Next.js-applikation utan databas. Den hämtar data från JobSearch på serversidan och använder cache för prestanda och stabilitet.

Samtidigt bör API-integrationen isoleras bakom ett eget datalager och ett normaliserat jobbformat. Då kan socionom.se senare lägga till PostgreSQL, JobStream och egna betalda annonser stegvis, utan att den första versionen blir onödigt dyr eller behöver kastas bort.

JobSearch-svar ska anpassas efter användningen: listor hämtar endast fälten som behövs för jobbkort och mappas till en lätt sammanfattning, individuella jobbsidor hämtar hela annonsen och sitemap använder ett separat minimalt svar. Extern HTML saneras därför endast när den fullständiga annonsen faktiskt ska visas.

Relevansurvalet använder verifierade JobTech-grupper tillsammans med negativa `occupation-name`-filter för närliggande roller som inte normalt är socionomjobb. Det bevarar JobSearch-resultatens antal och pagination. Uppenbara platshållartitlar filtreras dessutom lokalt med samma deterministiska regel för jobblistor, individuella jobbsidor och sitemap; ovanliga men riktiga titlar ska inte avvisas enbart på formuleringen.

Arbetsgivarlogotyper i jobbkort hämtas via JobSearch-fältet `logo_url` och laddas direkt från Arbetsförmedlingens domän med lazy loading och fasta bildmått. De ska inte gå genom Vercels bildoptimering i MVP:n, eftersom det skulle skapa extra bildtransformationer och CPU-användning för ett begränsat visuellt värde.

Canonical- och statuskontrollen för individuella jobb använder Proxy endast för direkta dokumentförfrågningar, där en riktig HTTP `308` eller `404` behövs. RSC-navigering och prefetch valideras av jobbsidan och ska passera Proxy utan externt uppslag. Proxy använder ett separat minimalt JobSearch-svar utan beskrivning eller retry, eftersom Next.js fetch-cache inte gäller där.

Individuella jobbsidor delar den förgenererade övergripande Open Graph-bilden i MVP:n. Jobbspecifik titel och beskrivning finns fortfarande i metadata, men en unik serverrenderad rasterbild per annons används inte eftersom bildgenereringen ger oproportionerlig CPU-belastning.
