import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { TrackedLink } from "@/components/AnalyticsEvents";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Annonsera för socionomer",
  description: "Anmäl intresse för att annonsera jobb och nå socionomer via socionom.se.",
  alternates: { canonical: "/annonsera" },
};

export default function AdvertisePage() {
  const subject = encodeURIComponent("Intresse för annonsering på socionom.se");

  return (
    <ContentPage
      lead="Nå personer som aktivt söker jobb inom socialt arbete – utan att försvinna i en bred, generell jobbportal."
      title="Annonsera på socionom.se"
    >
      <h2>Vi bygger upp tjänsten</h2>
      <p>Betalda platsannonser är ännu inte öppna för självbetjäning. Vi tar däremot gärna emot intresseanmälningar från kommuner, regioner, privata vårdgivare och andra arbetsgivare.</p>
      <h2>Vad vi planerar att erbjuda</h2>
      <ul>
        <li>Platsannonser riktade till socionomer och närliggande yrkesroller.</li>
        <li>Tydligt märkta premiumplaceringar under en bestämd period.</li>
        <li>En enkel resultatsammanställning utan personspårning.</li>
      </ul>
      <div className="contact-card">
        <h2>Berätta om ert behov</h2>
        <p>Skicka några rader om organisationen, rollen och ungefär när ni vill annonsera.</p>
        <TrackedLink eventName="employer_contact_click" href={`mailto:${siteConfig.advertisingEmail}?subject=${subject}`}>
          {siteConfig.advertisingEmail}
        </TrackedLink>
      </div>
    </ContentPage>
  );
}
