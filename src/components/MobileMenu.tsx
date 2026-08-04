"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { mainNavigation } from "@/config/site";
import { MenuIcon } from "./icons";

export function MobileMenu() {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  const close = useCallback(() => {
    if (detailsRef.current) detailsRef.current.open = false;
  }, []);

  // Headern ligger kvar monterad mellan sidbyten, så <details> behåller sitt
  // öppna läge om vi inte stänger den själva. Effekten täcker även bakåtknappen.
  useEffect(close, [close, pathname]);

  return (
    <details className="mobile-menu" ref={detailsRef}>
      <summary aria-label="Öppna meny">
        <MenuIcon />
        <span>Meny</span>
      </summary>
      {/* Stänger direkt vid klick, så att även länkar till nuvarande sida fungerar. */}
      <nav aria-label="Mobilnavigation" onClick={close}>
        {mainNavigation.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
        <Link href="/annonsera">Annonsera</Link>
      </nav>
    </details>
  );
}
