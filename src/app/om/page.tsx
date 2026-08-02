import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "Om socionom.se",
  description: "Om socionom.se och vår ambition att göra det enklare att hitta relevanta jobb inom socialt arbete.",
  alternates: { canonical: "/om" },
};

export default function AboutPage() {
  return (
    <ContentPage
      lead="Socionom.se är en fristående jobbsajt för socionomer och andra som söker kvalificerade roller inom socialt arbete."
      title="Om socionom.se"
    >
      <h2>En tydligare väg till relevanta jobb</h2>
      <p>Vår idé är enkel: samla relevanta jobb på ett ställe och presentera dem på ett lugnt, tydligt och lättanvänt sätt. Tjänsten är kostnadsfri för arbetssökande.</p>
      <p>I den första versionen hämtas jobb från Arbetsförmedlingens öppna JobSearch-data. Socionom.se är inte en del av eller en officiell tjänst från Arbetsförmedlingen.</p>
      <h2>En tjänst som får växa med målgruppen</h2>
      <p>Vi börjar med bra jobbsökning. Längre fram kan tjänsten kompletteras med redaktionellt innehåll, bevakningar och möjligheter för arbetsgivare att nå en relevant målgrupp.</p>
      <p>Vill du lämna synpunkter? <Link href="/kontakt">Kontakta oss gärna</Link>.</p>
    </ContentPage>
  );
}
