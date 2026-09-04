import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { siteConfig, socialProfiles } from "@/config/site";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontakta socionom.se med frågor, förbättringsförslag eller information om jobbannonser.",
  alternates: { canonical: "/kontakt" },
};

export default function ContactPage() {
  return (
    <ContentPage
      lead="Har du hittat en felaktig annons, vill föreslå en förbättring eller prata annonsering? Hör gärna av dig."
      title="Kontakta oss"
    >
      <div className="contact-card">
        <h2>Allmänna frågor</h2>
        <p>För synpunkter om sajten eller en annons:</p>
        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
      </div>
      <div className="contact-card">
        <h2>För arbetsgivare</h2>
        <p>För frågor om framtida annonsering och samarbeten:</p>
        <a href={`mailto:${siteConfig.advertisingEmail}`}>{siteConfig.advertisingEmail}</a>
      </div>
      <div className="contact-card">
        <h2>Instagram</h2>
        <p>Nya jobb och uppdateringar:</p>
        <a href={socialProfiles.instagram.url} rel="me noopener" target="_blank">
          {socialProfiles.instagram.handle}
        </a>
      </div>
      <p>Vi försöker svara så snart vi kan. Frågor om en specifik rekrytering bör ställas direkt till arbetsgivaren i annonsen.</p>
    </ContentPage>
  );
}
