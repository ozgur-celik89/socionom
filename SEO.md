# SEO-strategi för socionom.se

## Sammanfattning

SEO för socionom.se ska byggas kring tre typer av innehåll:

1. aktiva individuella jobbsidor
2. noggrant utvalda landningssidor för yrken och geografi
3. redaktionella yrkesguider och artiklar

Webbplatsen ska inte skapa eller indexera tusentals automatiska kombinationer av sökfilter. Endast sidor som har ett tydligt sökbehov, tillräckligt innehåll och ett verkligt värde för besökaren ska indexeras.

Den första versionen använder JobSearch API utan egen databas. SEO-lösningen ska fungera med denna arkitektur men samtidigt vara förberedd för en senare övergång till JobStream och PostgreSQL.

## SEO-principer

- Innehåll som ska indexeras måste vara serverrenderat.
- Varje indexerbar sida ska ha ett tydligt och unikt syfte.
- Individuella jobbsidor ska baseras på aktiva, verkliga jobb.
- Strukturerad data måste överensstämma med sidans synliga innehåll.
- Yrkes- och ortssidor ska vara redaktionellt kontrollerade.
- Tillfälliga sökningar och godtyckliga filterkombinationer ska normalt inte indexeras.
- Utgångna jobb ska tas bort från sökresultat så snabbt som möjligt.
- Webbplatsen ska skapa eget värde genom relevans, navigering och yrkesspecifikt innehåll, inte genom att skriva om externa annonser.

## Sidstruktur

Föreslagen SEO-struktur:

```text
/
/lediga-jobb
/lediga-jobb/[id]/[slug]
/lediga-jobb/yrke/[yrkesroll]
/lediga-jobb/ort/[region]
/lediga-jobb/yrke/[yrkesroll]/[region]
/yrkesguide/[slug]
/artiklar/[slug]
/om
/kontakt
/annonsera
```

Exempel:

```text
/lediga-jobb/12345678/socialsekreterare-till-stockholms-stad
/lediga-jobb/yrke/socialsekreterare
/lediga-jobb/ort/stockholm
/lediga-jobb/yrke/socialsekreterare/stockholm
/yrkesguide/skolkurator
/artiklar/intervjufragor-socionom
```

## Individuella jobbsidor

Varje aktiv annons får en serverrenderad sida med en stabil URL:

```text
/lediga-jobb/12345678/socialsekreterare-till-stockholms-stad
```

Annonsens ID är URL:ens stabila del. Sluggen är läsbar för användare och sökmotorer. Om titeln ändras ska sidan fortfarande kunna hittas via ID:t och ange den aktuella URL:en som canonical.

### Synligt innehåll

Varje jobbsida ska innehålla:

- originaltitel
- fullständig och sanerad annonsbeskrivning
- arbetsgivare
- ort eller orter
- information om distansarbete när den finns
- publiceringsdatum
- sista ansökningsdag
- anställningsform
- omfattning när den finns
- tydlig ansökningsknapp
- källa och länk till den riktiga ansökningssidan
- relaterade aktiva jobb
- breadcrumbs till relevanta yrkes- och ortssidor

Jobbtiteln och annonsbeskrivningen ska inte skrivas om för att lägga till sökord. En tredjepartsjobbsajt ska återge arbetsgivarens uppgifter korrekt.

### Metadata

Exempel på titel:

```text
Socialsekreterare hos Stockholms stad | socionom.se
```

Exempel på metabeskrivning:

```text
Sök tjänsten som socialsekreterare hos Stockholms stad i Stockholm. Se arbetsuppgifter, krav och sista ansökningsdag.
```

Titeln ska i första hand innehålla jobbroll, arbetsgivare och varumärke. Ort läggs till när titeln fortfarande förblir tydlig och rimligt kort.

## JobPosting-strukturerad data

Varje aktiv individuell jobbsida ska innehålla JSON-LD av typen `JobPosting`.

Relevanta egenskaper är bland annat:

- `title`
- `description`
- `datePosted`
- `validThrough`
- `hiringOrganization`
- `jobLocation`
- `employmentType`
- `identifier`
- `jobLocationType` för helt distansbaserade jobb
- `applicantLocationRequirements` när ett distansjobb har geografiska krav
- `baseSalary` endast när löneinformation faktiskt finns i källdatan

Regler:

- `JobPosting` får bara finnas på sidan för ett individuellt jobb.
- Det får inte läggas på jobb-, sök- eller kategorilistor.
- Informationen i JSON-LD måste finnas och stämma överens med det användaren ser.
- Jobbtiteln ska vara den verkliga jobbtiteln, utan ort, arbetsgivare eller marknadsföring som lagts till enbart för SEO.
- `directApply` får inte sättas till `true` om användaren skickas vidare genom flera steg eller till en annan tjänst.
- Utgångna jobb får inte behålla aktiv `JobPosting`-data.

Källa: [Googles dokumentation om JobPosting](https://developers.google.com/search/docs/appearance/structured-data/job-posting).

## Yrkesbaserade landningssidor

Skapa landningssidor för roller som är centrala för målgruppen:

```text
/lediga-jobb/yrke/socialsekreterare
/lediga-jobb/yrke/kurator
/lediga-jobb/yrke/bistandshandlaggare
/lediga-jobb/yrke/familjebehandlare
/lediga-jobb/yrke/behandlingsassistent
/lediga-jobb/yrke/lss-handlaggare
```

Kurator, skolkurator och hälso- och sjukvårdskurator samlas på `/lediga-jobb/yrke/kurator`. Den tidigare adressen `/lediga-jobb/yrke/skolkurator`, inklusive regionala varianter, omdirigeras permanent till motsvarande Kurator-sida. Redaktionellt innehåll om att arbeta som skolkurator kan ligga kvar på en separat yrkesguide eftersom den sidan besvarar andra frågor än jobblistan.

Varje sida ska innehålla:

- unik H1
- kort och relevant introduktion
- antal aktiva jobb
- serverrenderad jobblista
- länkar till relevanta orter
- länkar till närliggande yrkesroller
- länk till en relevant yrkesguide när den finns
- unik titel och metabeskrivning

Exempel:

```text
H1: Lediga jobb som socialsekreterare
Title: Lediga jobb som socialsekreterare | socionom.se
```

## Geografiska landningssidor

Börja med län och större orter där det regelbundet finns relevanta jobb:

```text
/lediga-jobb/ort/stockholm
/lediga-jobb/ort/goteborg
/lediga-jobb/ort/malmo
/lediga-jobb/ort/uppsala
/lediga-jobb/ort/skane
/lediga-jobb/ort/vastra-gotaland
```

Varje sida ska visa aktiva jobb och erbjuda interna länkar till populära yrkesroller i området.

Skapa inte automatiskt en indexerbar sida för varje kommun. Nya sidor ska läggas till först när Search Console, sökordsdata och jobbunderlaget visar att sidan kan ge verkligt värde.

## Kombinerade yrkes- och ortssidor

Exempel:

```text
/lediga-jobb/yrke/socialsekreterare/stockholm
/lediga-jobb/yrke/kurator/skane
```

En kombinationssida får indexeras endast när:

- det finns ett tydligt sökbehov
- det regelbundet finns relevanta jobb
- sidan har unik titel, H1 och introduktion
- den är länkad från webbplatsens navigation eller andra relevanta sidor
- den inte i praktiken duplicerar en annan sida

Tomma kombinationer ska returnera `404` och inte omdirigeras till en generell jobblista.

## Sökning och filter

Besökare ska kunna använda fritextsökning och filter, exempelvis:

```text
/lediga-jobb?q=kurator&lan=stockholm&anstallning=heltid
```

Dessa tillfälliga URL:er ska normalt inte indexeras. Annars kan kombinationer av yrke, ort, anställningsform, distans och sortering skapa ett mycket stort antal tunna sidor.

Rekommenderade regler:

- Redaktionella landningssidor indexeras.
- Individuella aktiva jobb indexeras.
- Fritextsökningar får `noindex`.
- Godtyckliga filterkombinationer får `noindex`.
- Sorteringsparametrar ska inte skapa egna canonical-sidor.
- Tomma, duplicerade eller orimliga filterkombinationer returnerar `404`.
- Filterlänkar ska byggas konsekvent med vanliga `&`-separerade URL-parametrar.

Google beskriver hur facetterad navigering kan skapa mycket stora URL-mängder och försvåra upptäckten av viktiga sidor. Källa: [Managing crawling of faceted navigation URLs](https://developers.google.com/crawling/docs/faceted-navigation).

## Canonical-URL:er

Varje indexerbar sida ska ange sin föredragna URL med `rel="canonical"`.

- Jobbsidor använder den aktuella URL:en med annons-ID och korrekt slug.
- Yrkes- och ortssidor använder sin rena landningsside-URL.
- Spårningsparametrar och sorteringsparametrar ska inte bli egna canonical-sidor.
- Endast canonical-URL:er ska inkluderas i sitemap.

Om en jobbsida nås med rätt ID men gammal eller felaktig slug ska sidan omdirigeras permanent till den aktuella canonical-URL:en.

Direkta dokumentförfrågningar valideras före rendering så att fel slug får HTTP `308` och borttagna jobb får HTTP `404`. Klientens RSC-navigering och prefetch gör samma innehållskontroll i jobbsidan men ska inte dubblera det externa uppslaget i Proxy.

Alla tidigare adresser under `/jobb` ska omdirigeras permanent till exakt motsvarande adress under `/lediga-jobb`. Omdirigeringarna ska behållas långsiktigt, medan interna länkar, canonical-URL:er och sitemap endast använder den nya URL-grenen.

## Utgångna och borttagna jobb

När JobSearch inte längre returnerar annonsen ska sidan:

- returnera `404` eller `410`
- inte innehålla `JobPosting`
- tas bort från jobbsitemap
- visa en användbar felsida med länkar till nya jobb

Om annonsens sista ansökningsdag har passerat men sidan fortfarande finns ska den inte presenteras som ett aktivt jobb. Google tillåter även att `validThrough` ligger i det förflutna eller att `JobPosting` tas bort, men grundstrategin för socionom.se är att endast aktiva jobb ska vara sökbara och ligga i sitemap.

Google rekommenderar Indexing API för snabbare rapportering av nya, ändrade och borttagna jobbannonser. I MVP:n utan databas används JobSearch och sitemap. En mer fullständig Indexing API-integration införs när JobStream och en lokal databas kan ge tillförlitliga förändringshändelser.

## Sitemap

Föreslagen struktur:

```text
/sitemap.xml
/sitemap-jobs.xml
/sitemap-pages.xml
/sitemap-guides.xml
```

### Jobbsitemap

Jobbsitemap ska:

- endast innehålla aktiva jobbsidor
- endast innehålla en URL när den minimala sitemap-datan säkert visar att flera JobSearch-poster motsvarar samma ansökningstillfälle
- endast innehålla canonical-URL:er
- använda absoluta HTTPS-URL:er
- ange korrekt `lastmod` från källdatan
- vara cachad så att varje sökmotoranrop inte orsakar en full ny API-hämtning

Utan databas genereras jobbsitemap genom paginerade, cachade anrop till JobSearch. Om antalet annonser eller API-belastningen gör detta opålitligt är det ett tekniskt skäl att införa JobStream och databas tidigare.

Dubbletter i sitemap identifieras konservativt med normaliserad titel, arbetsgivare, sista ansökningsdag och extern ansöknings-URL. Poster utan direktlänk slås inte ihop utifrån sitemapens minimala data. Den valda källidentiteten ska vara deterministisk så att samma jobb inte växlar URL mellan sitemap-genereringar.

En sitemap får innehålla högst 50 000 URL:er eller vara högst 50 MB okomprimerad. Större mängder delas upp och samlas i ett sitemap-index. Källa: [Googles dokumentation om sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

Sitemap ska skickas in i Google Search Console och refereras från `robots.txt`.

## Robots.txt

`robots.txt` ska:

- tillåta crawling av startsidan, landningssidor, guider och aktiva jobbsidor
- referera till webbplatsens sitemap
- inte blockera CSS, JavaScript eller andra resurser som behövs för rendering
- begränsa crawling av filterparametrar om de skapar ett omfattande URL-utrymme

Exempel:

```text
User-agent: *
Allow: /

Sitemap: https://socionom.se/sitemap.xml
```

Regler för filterparametrar läggs till först när den slutliga URL-strukturen är bestämd.

## Intern länkning

Interna länkar ska hjälpa både användare och sökmotorer att förstå webbplatsens struktur.

```text
Startsida
├── Alla jobb
│   ├── Yrkesroll
│   │   ├── Ort
│   │   └── Individuella jobb
│   └── Region
│       └── Individuella jobb
├── Yrkesguider
└── Artiklar
```

Principer:

- Startsidan länkar till viktigaste yrkesroller och regioner.
- Yrkesroller länkar till relevanta regioner.
- Regioner länkar till populära yrkesroller.
- Jobbsidor länkar till relevant yrkesroll, ort och relaterade jobb.
- Yrkesguider länkar till aktiva jobb inom rollen.
- Breadcrumbs visas på jobb-, yrkes-, region- och guidesidor.
- Viktiga sidor ska nås genom vanliga HTML-länkar och inte enbart genom sökformulär.

## Redaktionellt innehåll

Jobbannonserna finns även hos Arbetsförmedlingen. Socionom.se måste därför skapa ett tydligt eget värde runt annonserna genom bättre relevans, struktur och yrkesspecifikt innehåll.

Prioriterade innehållsområden:

- Vad gör en socialsekreterare?
- Jobba som skolkurator
- Socionom inom barn och unga
- Skillnaden mellan kurator och socialsekreterare
- Intervjufrågor för socionomer
- Vidareutbildningar för socionomer
- Lön för olika socionomyrken
- Arbeta som socionom inom kommun, region eller privat sektor

Föreslagna URL:er:

```text
/yrkesguide/socialsekreterare
/yrkesguide/skolkurator
/artiklar/intervjufragor-socionom
/artiklar/socionom-lon
```

Innehåll ska skrivas för att besvara verkliga frågor. Undvik generiska texter som endast byter ut yrke eller ort i samma mall. Fakta om löner, utbildningar och regler ska använda aktuella och primära källor.

## Metadata per sidtyp

### Startsida

```text
Title: Socionomjobb – lediga jobb för socionomer | socionom.se
Description: Hitta lediga jobb för socionomer i hela Sverige. Sök bland jobb som socialsekreterare, kurator, biståndshandläggare och fler roller.
```

### Yrkesroll

```text
Title: Lediga jobb som socialsekreterare | socionom.se
Description: Sök aktuella jobb som socialsekreterare i hela Sverige. Filtrera på ort, anställningsform och arbetsgivare.
```

### Region

```text
Title: Lediga socionomjobb i Stockholm | socionom.se
Description: Hitta aktuella jobb för socionomer i Stockholm. Se tjänster inom bland annat socialtjänst, skola och behandling.
```

### Jobbsida

```text
Title: [Jobbtitel] hos [Arbetsgivare] | socionom.se
Description: Sök tjänsten som [jobbtitel] hos [arbetsgivare] i [ort]. Se arbetsuppgifter, krav och sista ansökningsdag.
```

Metadata ska genereras från normaliserad och sanerad data. Saknade uppgifter ska utelämnas i stället för att ge konstiga eller tomma formuleringar.

I MVP:n har jobbsidor unik titel, beskrivning och canonical men delar webbplatsens förgenererade Open Graph-bild. En unik rasterbild per jobb införs först om mätdata visar ett tydligt värde som motiverar den extra serverberäkningen.

## Övrig strukturerad data

Utöver `JobPosting` kan webbplatsen använda:

- `Organization` på startsidan och om-sidan
- `BreadcrumbList` på jobb-, landnings- och guidesidor
- `Article` på redaktionella artiklar

Lägg bara till egenskaper som motsvarar synligt och verifierbart innehåll.

## Prestanda och Core Web Vitals

Mål för minst 75 procent av verkliga sidvisningar:

- LCP: högst `2,5 s`
- INP: högst `200 ms`
- CLS: högst `0,1`

Källa: [Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds).

Tekniska principer:

- serverrendera viktigt innehåll
- håll mängden klient-JavaScript låg
- använd Next.js-cache för JobSearch-anrop
- undvik stora hero-bilder
- reservera utrymme för bilder, annonser och dynamiskt innehåll
- ladda typsnitt effektivt och undvik onödiga vikter
- använd pagination i stället för att rendera mycket stora jobblistor

## Mätning

Konfigurera från lansering:

- Google Search Console
- Bing Webmaster Tools
- sitemap-rapportering
- rapport för `JobPosting` rich results
- Core Web Vitals
- integritetsvänlig webbstatistik

Viktiga händelser att mäta:

- klick på `Ansök`
- genomförda jobbsökningar
- använda filter
- sökningar utan resultat
- klick från landningssida till jobb
- registrering för jobbmejl när funktionen införs

Viktigaste SEO-måtten:

- antal giltiga och indexerade aktiva jobb
- organiska visningar och klick
- klickfrekvens per sidtyp
- positioner för prioriterade yrkes- och ortssökningar
- andel besök som går vidare till en ansökan
- fel för strukturerad data
- hur snabbt utgångna jobb försvinner ur Google

## Prioritering inför lansering

### Måste finnas

1. Serverrenderade jobbsidor.
2. Korrekt `JobPosting`.
3. Canonical-URL:er.
4. Unik metadata per sidtyp.
5. Sitemap med aktiva jobb.
6. `robots.txt`.
7. Hantering av borttagna jobb.
8. `noindex` för tillfälliga sök- och filtersidor.
9. Google Search Console.
10. Grundläggande intern länkning.

### Efter lansering

1. De 10–20 viktigaste yrkes- och ortssidorna.
2. Första yrkesguiderna.
3. Analys av sökningar utan resultat.
4. Utökning baserad på data från Search Console.
5. Indexing API när förändringshändelser kan hanteras tillförlitligt.

## Slutsats

Socionom.se ska använda kontrollerad programmatisk SEO: automatiska aktiva jobbsidor, men redaktionellt valda yrkes-, region- och kombinationssidor.

Domännamnet är tydligt och lätt att förstå, men den långsiktiga fördelen blir webbplatsens specialisering: bättre urval av socionomjobb, tydligare navigering, relevanta yrkesguider och en bättre upplevelse än generella jobbsajter.
