import Link from "next/link";
import { mainNavigation } from "@/config/site";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

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

        <MobileMenu />
      </div>
    </header>
  );
}
