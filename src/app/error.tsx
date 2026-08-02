"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="site-container not-found">
      <div>
        <span className="not-found-mark">!</span>
        <h1>Något gick fel</h1>
        <p>Sidan kunde inte visas just nu. Försök igen, eller gå tillbaka till jobbsökningen.</p>
        <div className="button-row centered-buttons">
          <button className="button button-primary" onClick={() => reset()} type="button">Försök igen</button>
          <Link className="button button-secondary" href="/jobb">Hitta jobb</Link>
        </div>
      </div>
    </div>
  );
}
