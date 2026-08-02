import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "Så väljer vi jobb",
  description: "Så hämtar och avgränsar socionom.se jobbannonser från Arbetsförmedlingens öppna data.",
  alternates: { canonical: "/sa-valjer-vi-jobb" },
};

export default function SelectionPage() {
  return (
    <ContentPage
      lead="Vi använder tydliga yrkesfilter och sökbegrepp för att visa annonser som är relevanta för socionomer."
      title="Så väljer vi jobb"
    >
      <h2>Datakälla</h2>
      <p>Jobbannonserna hämtas från Arbetsförmedlingens öppna JobSearch-data. Annonsens arbetsgivare ansvarar för innehållet, villkoren och ansökningsprocessen.</p>
      <h2>Vår avgränsning</h2>
      <p>Grundflödet omfattar yrkesgrupper som socialsekreterare, kuratorer, biståndsbedömare och övriga roller inom socialt arbete. För mer specifika sidor kombinerar vi yrkesgrupper med relevanta sökord.</p>
      <div className="info-box">
        <strong>En annons kan hamna fel.</strong> Automatiska filter är inte perfekta. Kontrollera alltid kvalifikationskrav och övrig information i originalannonsen innan du ansöker.
      </div>
      <h2>Aktualitet</h2>
      <p>Listorna uppdateras löpande. Om en annons tas bort eller ändras hos källan kan det dröja en kort stund innan ändringen syns här.</p>
      <h2>Framtida betalda annonser</h2>
      <p>Om vi senare erbjuder betald synlighet kommer sponsrade placeringar att märkas tydligt. Betalning ska inte påverka vilka organiska annonser som hämtas från Arbetsförmedlingen.</p>
    </ContentPage>
  );
}
