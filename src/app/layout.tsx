import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/manrope";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { SiteAnalytics } from "@/components/SiteAnalytics";
import { siteConfig, socialProfiles } from "@/config/site";
import { brandColors } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Socionomjobb – lediga jobb för socionomer | socionom.se",
    template: "%s | socionom.se",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    siteName: siteConfig.name,
    title: "Socionomjobb – lediga jobb för socionomer",
    description: siteConfig.description,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: "Socionomjobb – lediga jobb för socionomer",
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: brandColors.shell,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="sv">
      <body>
        <a className="skip-link" href="#main-content">Hoppa till innehållet</a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <SiteAnalytics />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteConfig.name,
            url: siteConfig.url,
            email: siteConfig.email,
            sameAs: [socialProfiles.instagram.url],
          }}
        />
      </body>
    </html>
  );
}
