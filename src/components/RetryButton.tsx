"use client";

import { useRouter } from "next/navigation";

/**
 * Felet sitter i serverns hämtning, inte i det som redan står på sidan.
 * refresh() hämtar om serverkomponenterna utan att ladda om dokumentet, så
 * besökaren behåller sin plats i listan och sina filter.
 */
export function RetryButton() {
  const router = useRouter();

  return (
    <button className="button button-secondary" onClick={() => router.refresh()} type="button">
      Försök igen
    </button>
  );
}
