# Lanseringsplan för socionom.se

## Syfte

Detta är den operativa checklistan för att lansera MVP:n. En punkt markeras som klar först när den är utförd och verifierad.

## 1. Ägare och grunduppgifter

- [ ] Juridiskt namn är bestämt.
- [ ] Organisationsnummer är ifyllt där det krävs.
- [ ] Post- eller besöksadress är bestämd.
- [ ] Ansvarig kontaktperson är utsedd.
- [ ] `hej@socionom.se` fungerar.
- [ ] `annonsera@socionom.se` fungerar.
- [ ] Kontaktuppgifterna visas tydligt på webbplatsen.

## 2. Domän och e-post

- [ ] `socionom.se` pekar på produktionsmiljön.
- [ ] HTTPS fungerar utan certifikatvarningar.
- [ ] Canonical-domän är beslutad.
- [ ] Den andra varianten av `www` och apex omdirigeras permanent till canonical-domänen.
- [ ] SPF är konfigurerat.
- [ ] DKIM är konfigurerat.
- [ ] DMARC är konfigurerat.
- [ ] Avsändaradresser har testats mot vanliga e-postleverantörer.

## 3. JobTech och relevans

- [ ] Aktuella JobTech concept IDs är verifierade.
- [ ] Yrkesrollerna i `MVP.md` är konfigurerade.
- [ ] Inkluderande regler är dokumenterade i koden.
- [ ] Exkluderande regler är dokumenterade i koden.
- [ ] Minst 200 representativa jobb har granskats manuellt.
- [ ] Tveksamma yrkesroller har kontrollerats av någon med god domänkunskap.
- [ ] API-timeout och retry är testade.
- [ ] Cache fungerar som avsett.
- [ ] Källinformation och fristående-status visas tydligt.

## 4. Innehåll

- [ ] Startsidan har slutlig copy.
- [ ] `Om` är publicerad.
- [ ] `Så väljer vi jobb` är publicerad.
- [ ] `Kontakt` är publicerad.
- [ ] `Annonsera` är publicerad.
- [ ] `Integritet` är publicerad och anpassad till verkliga leverantörer.
- [ ] `Kakor` beskriver den faktiska implementationen.
- [ ] Alla platshållare är borttagna.
- [ ] Alla externa länkar är testade.
- [ ] Stavning och tonalitet är granskade.

## 5. Juridik och integritet

- [ ] Personuppgiftsansvarig är identifierad.
- [ ] Behandlade personuppgifter är kartlagda.
- [ ] Ändamål, rättslig grund och lagringstid är dokumenterade.
- [ ] Personuppgiftsbiträden och leverantörer är listade.
- [ ] Eventuella tredjelandsöverföringar är bedömda och dokumenterade.
- [ ] Personuppgiftsbiträdesavtal finns där det krävs.
- [ ] Kontaktväg för registerutdrag, rättelse och radering fungerar.
- [ ] Inga icke-nödvändiga kakor sätts utan giltigt samtycke.
- [ ] Vercel Web Analytics är konfigurerat utan personuppgifter i URL:er eller events.
- [ ] Sökfrågor skickas inte som analysdata.
- [ ] Juridisk bedömning görs innan betalning eller självbetjäning införs.

Referenser:

- [IMY: Vad ska en integritetspolicy innehålla?](https://www.imy.se/vanliga-fragor-och-svar/vad-ska-en-integritetspolicy-innehalla/)
- [PTS: Kakor](https://pts.se/internet-och-telefoni/kakor-cookies/)
- [Konsumentverket: E-handelslagen](https://www.konsumentverket.se/lagar/e-handelslagen/)
- [PTS: Tillgänglighetslagen](https://pts.se/digital-inkludering/lagen-om-vissa-produkters-och-tjansters-tillganglighet/)

## 6. SEO

- [ ] Alla indexerbara sidor är serverrenderade.
- [ ] Sidtitlar och metabeskrivningar är verifierade.
- [ ] Canonical-URL:er är korrekta.
- [ ] Jobbsidor använder stabilt annons-ID.
- [ ] Fel slug omdirigeras till korrekt canonical.
- [ ] `JobPosting` finns endast på aktiva individuella jobb.
- [ ] Ett urval jobbsidor validerar i Rich Results Test.
- [ ] Sök- och filterparametrar får `noindex` enligt `SEO.md`.
- [ ] Sitemap innehåller endast canonical och indexerbara URL:er.
- [ ] Utgångna jobb försvinner från sitemap.
- [ ] Robots.txt refererar till sitemap.
- [ ] Stagingmiljön har `noindex`.
- [ ] Google Search Console är verifierad.
- [ ] Sitemap är inskickad i Search Console.
- [ ] Bing Webmaster Tools är konfigurerat.

## 7. Tillgänglighet

- [ ] Hela webbplatsen kan användas med tangentbord.
- [ ] Fokusmarkering är tydlig på alla interaktiva element.
- [ ] Formulär har synliga etiketter och begripliga fel.
- [ ] Rubrikhierarkin är logisk.
- [ ] Landmärken som header, nav, main och footer används korrekt.
- [ ] Färgkontraster är kontrollerade.
- [ ] Innehåll fungerar vid 200 procent zoom.
- [ ] Klickytor fungerar på mobil.
- [ ] Status och fel kommuniceras inte enbart med färg.
- [ ] Minskad rörelse respekteras.
- [ ] Grundflödet är testat med skärmläsare.
- [ ] Automatisk tillgänglighetskontroll har inga kritiska fel.

## 8. Säkerhet

- [ ] Extern HTML saneras med allowlist.
- [ ] Externa länkar valideras.
- [ ] Endast HTTPS används i produktion.
- [ ] Content Security Policy är konfigurerad och testad.
- [ ] Övriga relevanta säkerhetsheaders är konfigurerade.
- [ ] Hemligheter finns endast i miljövariabler på serversidan.
- [ ] URL-parametrar valideras och längdbegränsas.
- [ ] Produktionsfel visar inte stack traces.
- [ ] Beroenden är granskade och uppdaterade.
- [ ] Kontaktflödet har rimligt spamskydd.

## 9. Funktionell kvalitet

- [ ] Fritextsökning fungerar.
- [ ] Yrkesfilter fungerar.
- [ ] Regionfilter fungerar.
- [ ] Anställningsform fungerar när datan finns.
- [ ] Distansfilter fungerar när datan finns.
- [ ] Pagination fungerar och bevarar filter.
- [ ] Återställ filter fungerar.
- [ ] Tomma resultat har ett användbart tillstånd.
- [ ] Jobb med saknade fält visas utan trasig layout.
- [ ] Borttagna jobb hanteras korrekt.
- [ ] API-timeout visar ett begripligt reservläge.
- [ ] Ansökningsknappen leder till rätt annons.
- [ ] Mobilnavigationen fungerar.
- [ ] Anpassad 404 fungerar.

## 10. Prestanda

- [ ] Ingen onödig stor hero-bild används.
- [ ] Typsnitt laddas effektivt.
- [ ] Onödigt klient-JavaScript har tagits bort.
- [ ] Dynamiskt innehåll reserverar utrymme och orsakar inte layoutskiften.
- [ ] Cache headers och Next.js-återvalidering är verifierade.
- [ ] Lighthouse eller motsvarande kontroll är genomförd på centrala sidtyper.
- [ ] Core Web Vitals mäts efter lansering.

Mål:

- LCP högst `2,5 s`
- INP högst `200 ms`
- CLS högst `0,1`

## 11. Analys och övervakning

- [ ] Vercel Web Analytics är aktiverat och dokumenterat.
- [ ] Känsliga parametrar filtreras bort från analysen.
- [ ] Search Console samlar data.
- [ ] Felövervakning är aktiverad.
- [ ] Ett testfel har verifierat att felrapporteringen fungerar.
- [ ] API-fel går att skilja från vanliga 404-fel.
- [ ] Upptidskontroll finns för startsidan och en central jobbvy.
- [ ] Ansvarig person vet var fel och driftstatus följs upp.

## 12. Miljöer och release

- [ ] Produktions- och stagingmiljö är separerade.
- [ ] Miljövariabler är dokumenterade utan hemliga värden.
- [ ] Staging använder testbar men icke-indexerbar konfiguration.
- [ ] Produktion använder `https://socionom.se` i metadata och sitemap.
- [ ] Build, typkontroll och tester passerar.
- [ ] Produktionsdeploy är reproducerbar från Git.
- [ ] En enkel rollback-väg är känd.
- [ ] Slutlig smoke test är genomförd efter DNS- och produktionsdeploy.

## 13. Första veckan efter lansering

- [ ] Kontrollera API-fel dagligen.
- [ ] Kontrollera Search Console för indexerings- och schemafel.
- [ ] Granska nya sökresultat för relevans.
- [ ] Kontrollera sökningar utan resultat.
- [ ] Kontrollera ansökningslänkar genom stickprov.
- [ ] Följ Core Web Vitals och mobilproblem.
- [ ] Samla arbetsgivarintresse från sidan `Annonsera`.
- [ ] Dokumentera förbättringar utan att automatiskt utöka MVP:n.

## Lanseringsbeslut

Lansering får ske när samtliga blockerande punkter är klara. Följande är alltid blockerande:

- felaktigt eller tydligt irrelevant jobburval
- trasiga ansökningslänkar
- aktiv XSS-risk eller osanerad extern HTML
- felaktig `JobPosting` på list- eller utgångna sidor
- indexerbar stagingmiljö
- saknade integritets- eller kontaktuppgifter
- kritiska tangentbords- eller mobilproblem
- sitemap som listar borttagna eller icke-canonical sidor

