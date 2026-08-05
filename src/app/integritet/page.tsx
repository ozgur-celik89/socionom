import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Integritetspolicy",
  description: "Så behandlar socionom.se personuppgifter och skyddar besökarnas integritet.",
  alternates: { canonical: "/integritet" },
};

export default function PrivacyPage() {
  return (
    <ContentPage
      lead="Vi samlar in så lite information som möjligt och säljer aldrig personuppgifter."
      title="Integritetspolicy"
    >
      <p><strong>Senast uppdaterad:</strong> 5 augusti 2026</p>
      <h2>Personuppgiftsansvar</h2>
      <p>Socionom.se ansvarar för behandlingen av personuppgifter på webbplatsen. Kontakta oss på <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> vid frågor.</p>
      <h2>När du besöker webbplatsen</h2>
      <p>Vi använder integritetsvänlig, aggregerad besöksstatistik för att förstå vilka sidor som används och förbättra tjänsten. Sökord och filter tas bort från den webbadress som skickas till statistiktjänsten.</p>
      <p>Vid jobbsökningar kan vi mäta användningen av fasta filtervärden, exempelvis yrkesområde, region, omfattning, distans och sortering. Vi mäter också aggregerat vilken typ av jobblista som leder till att en annons öppnas. Fritextsökningar, jobbtitlar och arbetsgivarnamn skickas inte i dessa händelser.</p>
      <p>Vår driftleverantör kan behandla tekniska loggar, till exempel IP-adress, tidpunkt och begärd sida, för säkerhet och stabilitet. Sådana uppgifter sparas enligt leverantörens gällande lagringstider.</p>
      <h2>Felövervakning</h2>
      <p>I produktion kan vi använda Sentry för att upptäcka och felsöka tekniska fel. Konfigurationen tar bort sökparametrar, formulärdata, kakor och användaruppgifter innan en felrapport skickas. Uppgifterna används med stöd av vårt berättigade intresse av att hålla tjänsten säker och fungerande.</p>
      <h2>När du kontaktar oss</h2>
      <p>Om du skickar e-post behandlar vi din e-postadress och innehållet i meddelandet för att kunna svara. Uppgifterna sparas bara så länge de behövs för ärendet eller enligt lag.</p>
      <h2>Jobbannonser och externa länkar</h2>
      <p>Jobbinformation hämtas från Arbetsförmedlingens öppna data. När du går vidare till en arbetsgivare eller Arbetsförmedlingen gäller den externa aktörens integritetspolicy.</p>
      <h2>Dina rättigheter</h2>
      <p>Du kan begära information om dina personuppgifter samt rättelse eller radering där det är tillämpligt. Du har också rätt att lämna klagomål till Integritetsskyddsmyndigheten.</p>
    </ContentPage>
  );
}
