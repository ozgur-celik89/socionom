import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "Kakor",
  description: "Information om kakor och lokal lagring på socionom.se.",
  alternates: { canonical: "/kakor" },
};

export default function CookiesPage() {
  return (
    <ContentPage
      lead="Den första versionen av socionom.se använder inga kakor för annonsering, profilering eller personligt anpassat innehåll."
      title="Kakor på socionom.se"
    >
      <h2>Besöksstatistik</h2>
      <p>Vi använder Vercel Web Analytics för aggregerad statistik. Lösningen är konfigurerad utan spårningskakor och vi tar bort sökfrågor från webbadressen innan ett sidbesök skickas.</p>
      <h2>Nödvändig lagring</h2>
      <p>Webbplatsens driftleverantör kan använda tekniska mekanismer som krävs för säkerhet och leverans av sidan. Om vi senare inför funktioner som kräver samtycke uppdaterar vi denna sida och visar ett tydligt val innan sådan lagring aktiveras.</p>
      <h2>Externa webbplatser</h2>
      <p>När du klickar vidare till Arbetsförmedlingen eller en arbetsgivares webbplats kan den webbplatsen använda egna kakor. Deras villkor gäller då.</p>
    </ContentPage>
  );
}
