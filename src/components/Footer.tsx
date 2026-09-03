import Link from "next/link";
import { occupationCategories } from "@/config/jobs";
import { siteConfig } from "@/config/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-grid">
        <div className="footer-intro">
          <Logo />
          <p>En fristående jobbsajt med fokus på socionomer och socialt arbete i Sverige.</p>
        </div>

        <div>
          <h2>Hitta jobb</h2>
          <ul>
            <li><Link href="/lediga-jobb">Alla jobb</Link></li>
            {occupationCategories.map((category) => (
              <li key={category.slug}>
                <Link href={`/lediga-jobb/yrke/${category.slug}`}>{category.shortLabel}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2>Socionom.se</h2>
          <ul>
            <li><Link href="/om">Om oss</Link></li>
            <li><Link href="/sa-valjer-vi-jobb">Så väljer vi jobb</Link></li>
            <li><Link href="/annonsera">Annonsera</Link></li>
            <li><Link href="/kontakt">Kontakt</Link></li>
          </ul>
        </div>

        <div>
          <h2>Information</h2>
          <ul>
            <li><Link href="/integritet">Integritet</Link></li>
            <li><Link href="/kakor">Kakor</Link></li>
            <li><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></li>
          </ul>
        </div>
      </div>

      <div className="site-container footer-bottom">
        <p>© {new Date().getFullYear()} socionom.se</p>
      </div>
    </footer>
  );
}
