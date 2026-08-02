import Link from "next/link";
import { mainNavigation } from "@/config/site";
import { Logo } from "./Logo";
import { MenuIcon } from "./icons";

export function Header() {
  return (
    <header className="site-header">
      <div className="site-container header-inner">
        <Logo />

        <nav aria-label="Huvudnavigation" className="desktop-nav">
          {mainNavigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <Link className="button button-secondary button-small" href="/annonsera">
            Annonsera
          </Link>
        </nav>

        <details className="mobile-menu">
          <summary aria-label="Öppna meny">
            <MenuIcon />
            <span>Meny</span>
          </summary>
          <nav aria-label="Mobilnavigation">
            {mainNavigation.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href="/annonsera">Annonsera</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
