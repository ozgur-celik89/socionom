"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="sv">
      <body>
        <main className="site-container not-found">
          <div>
            <span className="not-found-mark">!</span>
            <h1>Något gick fel</h1>
            <p>Sidan kunde inte visas just nu. Ladda om sidan eller försök igen om en liten stund.</p>
            <Link className="button button-primary" href="/jobb">Hitta jobb</Link>
          </div>
        </main>
      </body>
    </html>
  );
}
