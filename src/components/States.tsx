import { AlertIcon, ArrowRightIcon } from "./icons";
import { TrackedLink, ZeroResultsTracker } from "./AnalyticsEvents";
import Link from "next/link";

export function JobResultsSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="job-results-loading">
      <div className="results-heading">
        <h2>Lediga jobb</h2>
        <p>Hämtar aktuella jobb…</p>
      </div>
      <div aria-hidden="true" className="job-list">
        {Array.from({ length: 3 }, (_, index) => (
          <div className="job-card job-card-skeleton" key={index}>
            <div className="skeleton-topline">
              <span className="skeleton-line skeleton-badge" />
              <span className="skeleton-line skeleton-source" />
            </div>
            <div>
              <span className="skeleton-line skeleton-title" />
              <span className="skeleton-line skeleton-employer" />
            </div>
            <div className="skeleton-meta">
              <span className="skeleton-line" />
              <span className="skeleton-line" />
              <span className="skeleton-line" />
            </div>
            <div className="skeleton-footer">
              <span className="skeleton-line" />
              <span className="skeleton-line" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyJobsState() {
  return (
    <div className="state-card">
      <ZeroResultsTracker />
      <div className="state-icon"><AlertIcon /></div>
      <h2>Inga jobb matchade din sökning</h2>
      <p>Prova ett bredare sökord, välj hela Sverige eller ta bort något filter.</p>
      <Link className="button button-secondary" href="/lediga-jobb">Visa alla jobb</Link>
    </div>
  );
}

export function ApiErrorState() {
  return (
    <div className="state-card state-card-error">
      <div className="state-icon"><AlertIcon /></div>
      <h2>Jobben kunde inte hämtas just nu</h2>
      <p>Arbetsförmedlingens tjänst svarar inte. Försök gärna igen om en liten stund.</p>
      <a className="button button-secondary" href="">Försök igen</a>
    </div>
  );
}

export function EmployerCallout() {
  return (
    <aside className="employer-callout">
      <div>
        <h2>Nå Sveriges socionomer</h2>
        <p>Vill ni synas för en relevant och yrkesinriktad målgrupp? Berätta om era rekryteringsbehov.</p>
      </div>
      <TrackedLink className="button button-secondary" eventName="employer_contact_click" href="/annonsera">
        Läs om annonsering <ArrowRightIcon />
      </TrackedLink>
    </aside>
  );
}
