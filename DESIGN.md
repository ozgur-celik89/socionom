# Designriktning för socionom.se

## Sammanfattning

Socionom.se ska ha en varm, nordisk och förtroendeingivande identitet. Uttrycket ska vara professionellt nog för kommuner, organisationer och arbetsgivare, men mänskligare och mjukare än en traditionell jobbsajt.

Den visuella grunden är:

- djup skogsgrön för förtroende och stabilitet
- ren vit som huvudsaklig bakgrund
- ljus puderrosa för värme och personlighet
- mörk grönsvart för tydlig och behaglig text
- gott om luft och ett lugnt visuellt tempo

## Färgpalett

| Användning | Färg | Hex |
|---|---|---|
| Primärfärg, knappar och header | Djup skogsgrön | `#185A4A` |
| Hover och mörkare gröna ytor | Mörk skogsgrön | `#12473A` |
| Huvudtext | Mörk grönsvart | `#17211F` |
| Sidbakgrund | Ren vit | `#FFFFFF` |
| Navigation och footer | Mörk djupgrön | `#143F35` |
| Kort och formulär | Vit | `#FFFFFF` |
| Ljus tonad yta | Ljus salviagrön | `#E6F0EB` |
| Kantlinjer | Grågrön | `#D8E2DD` |
| Sekundär text | Dämpad grågrön | `#66736F` |
| Mjuk accent | Ljus puderrosa | `#F4DCE5` |
| Accentens hover eller kant | Dämpad rosa | `#DDAFC0` |
| Text på rosa ytor | Mörk gammelrosa | `#88445C` |

Den ljusa puderrosa färgen används främst som bakgrund, markering eller dekorativ detalj. Den ska inte användas som vanlig text på vit bakgrund eftersom kontrasten då blir för svag. Där rosa text behövs används den mörkare gammelrosa färgen.

## Färgernas roller

### Skogsgrönt

Skogsgrönt är varumärkets primära färg och används för:

- primära knappar
- logotyp och navigation
- aktiva filter
- länkar och ikoner
- rubriker på tonade ytor
- fokusmarkeringar

Färgen signalerar lugn, förtroende och stabilitet och skiljer samtidigt socionom.se från Arbetsförmedlingens blå identitet.

### Puderrosa

Puderrosa tillför värme utan att webbplatsen blir barnslig eller romantisk. Den används sparsamt för:

- etiketten `Nytt`
- bakgrund bakom viktiga informationsrutor
- markering av jobbmejl och redaktionellt innehåll
- små detaljer i logotypen
- diskreta hover-effekter

Puderrosa ska inte användas för felmeddelanden. Fel och destruktiva åtgärder behöver en separat, tydlig röd färg.

### Vitt och salviagrönt

Ren vit är webbplatsens huvudsakliga bakgrund och används även för kort och formulär. Ljus salviagrön används för att dela upp större sektioner och skapa variation utan starka färgbyten. Crème och benvita toner ska inte användas.

## Grundläggande designtokens

```css
:root {
  --color-primary: #185a4a;
  --color-primary-hover: #12473a;

  --color-text: #17211f;
  --color-text-muted: #66736f;

  --color-background: #ffffff;
  --color-surface: #ffffff;
  --color-surface-green: #e6f0eb;
  --color-shell: #143f35;
  --color-border: #d8e2dd;

  --color-accent: #f4dce5;
  --color-accent-border: #ddafc0;
  --color-accent-text: #88445c;

  --radius-small: 8px;
  --radius-medium: 12px;
  --radius-large: 16px;
}
```

## Typografi

### Typsnitt

Använd **Manrope** för hela webbplatsen. Typsnittet är modernt, tydligt och vänligt utan att kännas barnsligt.

Om ett mer neutralt och myndighetsnära uttryck önskas är **Source Sans 3** ett bra alternativ.

### Storlekar

| Element | Desktop | Mobil |
|---|---:|---:|
| Huvudrubrik | `48–52px` | `34–38px` |
| Sidrubrik | `32–36px` | `28–32px` |
| Sektionsrubrik | `24–28px` | `22–24px` |
| Jobbtitel | `18–20px` | `18px` |
| Brödtext | `16–17px` | `16px` |
| Metadata och etiketter | `14px` | `14px` |

Brödtext bör ha ett radavstånd på ungefär `1.5–1.65`. Rubriker kan använda vikterna `650–700` och brödtext `400–500`.

## Visuell stil

Webbplatsen ska använda:

- gott om luft mellan sektioner
- en konsekvent avståndsskala baserad på 8 pixlar
- tunna, mjuka kantlinjer
- rundade hörn på cirka `12–14px`
- mycket diskreta skuggor
- tydliga rubriker och korta textstycken
- små, konsekventa linjeikoner
- lugna vita, gröna och rosa bakgrundsytor

Webbplatsen ska undvika:

- generiska bilder på människor som håller händer
- stora blå eller flerfärgade gradienter
- överdrivet rundade och lekfulla komponenter
- starka skuggor och glaseffekter
- täta jobblistor med för mycket information
- för många accentfärger på samma sida
- flera små, likformiga kategori- eller funktionskort i samma rad där varje kort bygger på en stor ikonbricka
- dekorativa cirklar, blobbar och fristående former i hero-sektionen

## Sidhuvud

Sidhuvudet ska vara enkelt och luftigt.

```text
[portfölj] socionom.se        Hitta jobb   Yrkesområden   Om oss   Annonsera
```

På desktop placeras logotypen till vänster och navigationen till höger. `Annonsera` kan visas som en sekundär knapp med grön kant. På mobil används en enkel menyknapp.

Sidhuvudet har samma mörkgröna bakgrund som footern (`#143F35`), vit logotyp och ljus navigation. Det har en diskret halvtransparent ljus nederkant och ingen tydlig skugga. Knappen `Annonsera` är transparent med vit kant och blir vit vid hover.

## Logotyp

Ordlogotypen är:

```text
socionom.se
```

I navigation och footer sätts `socionom` i vitt och `.se` i en tydlig ljusrosa ton. På ljusa ytor sätts `socionom` i mörk skogsgrön och `.se` i mörk gammelrosa. Huvudnavigationen använder en fristående SVG-logotyp där det befintliga portföljmärket från favicon och OG-bild står framför ordmärket. SVG-filen bäddar in projektets exakta Manrope-webbfont och renderar ordmärket i vikt 780, med samma visuella storlek, teckenavstånd och textrendering som footerns HTML-text. Märket behåller sin skogsgröna färg och delarna centreras optiskt. Footern använder fortsatt enbart ordmärket som HTML-text.

Logotypen ska fortsatt undvika hjärtan, händer och generiska personfigurer. Portföljmärket är den gemensamma symbolen för favicon, OG-bild och huvudnavigation.

## Startsidan

Startsidan ska snabbt förklara vad webbplatsen erbjuder och leda användaren till sökningen.

### Hero

Föreslagen huvudrubrik:

> Hitta nästa jobb som socionom

Föreslagen ingress:

> Samlade socionomjobb från hela Sverige – enkelt att söka, filtrera och bevaka.

Direkt under texten placeras sökningen:

```text
[ Yrke eller sökord           ] [ Ort eller län         ] [ Sök jobb ]
```

Hero-sektionen har en mycket ljus salviagrön bakgrund men inga dekorativa cirklar, blobbar eller andra fristående former. Rubrik, ingress och sökning ska bära ytan utan illustrationer.

Startsidan ska inte ha en separat sektion för `Populära yrkesområden` utformad som en rad små kort med ikonbrickor. Yrkesroller nås i stället via navigation, sökning och relevanta interna länkar.

### Rekommenderad ordning

1. Hero med sökning
2. Senaste socionomjobben
3. Jobb per region
4. Jobbevakning via e-post
5. Information till arbetsgivare

Sektionen för jobbmejl kan använda puderrosa bakgrund för att skilja sig från övriga delar av sidan.

## Sökning och filter

Sökfältet är webbplatsens viktigaste interaktiva komponent och ska därför vara stort och tydligt.

- vit bakgrund
- tydlig grågrön kant
- grön fokusmarkering
- minst 48 pixlars höjd
- stora klickytor även på mobil
- textetiketter som inte enbart ersätts av ikoner

På desktop kan filter visas i en vänsterspalt eller i en horisontell rad. På mobil öppnas filtren i en panel underifrån.

Aktiva filter visas som gröna eller ljusgröna filterbrickor med en tydlig knapp för att ta bort dem.

## Jobbkort

Varje jobbkort ska visa:

- jobbtitel
- arbetsgivare
- ort
- anställningsform
- publiceringsdatum
- sista ansökningsdag när den finns
- eventuell distansmarkering
- arbetsgivarens logotyp när den finns i källdatan

Datakällan ska inte upprepas på varje jobbkort eller individuell jobbsida. Den förklaras tydligt i sidfoten och på webbplatsens informationssidor.

Arbetsgivarens logotyp placeras diskret uppe till höger på kortet, där den inte konkurrerar med jobbtiteln. Logotypens yta har fasta mått och bilden skalas proportionerligt utan beskärning. När logotyp saknas visas ingen platshållare.

Exempel:

```text
┌──────────────────────────────────────────────────────┐
│ NYTT                                                 │
│ Socialsekreterare till barn och unga                 │
│ Stockholms stad                                      │
│                                                      │
│ Stockholm · Heltid · Tillsvidare                     │
│ Publicerad idag                       Visa jobbet →  │
└──────────────────────────────────────────────────────┘
```

Kortets grundstil:

- vit bakgrund
- `1px` grågrön kant
- `12–14px` rundning
- ingen eller mycket svag grundskugga
- grön kant och lätt skugga vid hover
- hela kortet kan vara klickbart

Etiketten `Nytt` kan ha puderrosa bakgrund och mörk gammelrosa text. Små linjeikoner får användas för metadata som plats, arbetstid och anställningsform eftersom de hjälper användaren att skanna informationen.

Sponsrade jobb ska märkas tydligt med `Sponsrat`. De ska passa in i designen och får inte kamoufleras som vanliga organiska resultat.

## Knappar

### Primär knapp

- skogsgrön bakgrund
- vit text
- mörkare grön vid hover
- tydlig fokusram

Används för `Sök jobb`, `Visa jobbet`, `Skapa jobbevakning` och andra huvudsakliga handlingar.

### Sekundär knapp

- vit eller transparent bakgrund
- skogsgrön text
- grön kant
- ljus salviagrön bakgrund vid hover

### Rosa knapp

Puderrosa bör inte vara webbplatsens huvudsakliga knappfärg. Den kan användas för mindre, kompletterande handlingar med mörk gammelrosa text, exempelvis i sektionen för jobbmejl.

## Ikoner och illustrationer

Använd enkla linjeikoner med rundade ändar. Ikoner får hjälpa användaren att skanna plats, arbetstid, anställningsform, publiceringsdatum, distansarbete och funktionella kontroller.

Det som ska undvikas är inte ikoner generellt, utan många små, likformiga kort i samma rad där varje kort får en framträdande ikonbricka eller badge som huvudsakligt visuellt innehåll. Hero ska inte ha dekorativa cirklar eller blobbar.

Fotografier kan användas i redaktionella artiklar eller på sidan för arbetsgivare, men startsidans viktigaste yta bör inte bygga på ett generiskt stockfoto.

## Tonalitet

Språket ska vara rakt, varmt och respektfullt.

Bra exempel:

- `Hitta ditt nästa socionomjobb`
- `Nya jobb inom socialt arbete`
- `Få relevanta jobb direkt i mejlen`
- `Nå Sveriges socionomer`
- `Se alla jobb i Stockholm`

Undvik överdrivna formuleringar som:

- `Drömjobbet väntar på dig`
- `Bli en vardagshjälte`
- `Förändra världen redan idag`

Målgruppen behöver framför allt relevans, tydlighet och förtroende.

## Tillgänglighet

Designen ska fungera med tangentbord, skärmläsare och hög zoomnivå. Viktiga tillstånd får aldrig kommuniceras enbart med färg.

- behåll synliga etiketter på formulärfält
- använd tydliga fokusmarkeringar
- säkerställ tillräcklig färgkontrast
- använd minst 16 pixlars brödtext
- ge knappar och länkar stora klickytor
- respektera användarens inställning för minskad rörelse
- kontrollera färger i både normala, hover- och inaktiva tillstånd

## Mobil design

Sidan ska designas mobile-first. På mindre skärmar:

- staplas sökfälten vertikalt
- visas sökknappen i full bredd
- öppnas filter i en separat panel
- behåller jobbkort samma informationsordning
- placeras viktigaste informationen före metadata
- undviks horisontell scroll

Den nedersta delen av en individuell jobbsida kan ha en fast men diskret knapp för `Ansök`, så länge den inte täcker innehåll.

## Samlad designprincip

Socionom.se ska kännas som en modern, specialiserad och pålitlig yrkesplats – inte som en myndighetsportal och inte som en generisk startup.

Den rekommenderade kombinationen är:

> Skogsgrönt för förtroende, vitt för tydlighet och ljus puderrosa för mänsklig värme.

Puderrosa används som en återhållsam accent. Skogsgrönt förblir den primära handlingsfärgen för att webbplatsen ska vara tydlig, professionell och tillgänglig.
