import { AlertIcon, ArrowRightIcon } from "./icons";
import { TrackedLink, ZeroResultsTracker } from "./AnalyticsEvents";
import Link from "next/link";

export function EmptyJobsState() {
  return (
    <div className="state-card">
      <ZeroResultsTracker />
      <div className="state-icon"><AlertIcon /></div>
      <h2>Inga jobb matchade din sökning</h2>
      <p>Prova ett bredare sökord, välj hela Sverige eller ta bort något filter.</p>
      <Link className="button button-secondary" href="/jobb">Visa alla jobb</Link>
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
        <span className="eyebrow">För arbetsgivare</span>
        <h2>Nå Sveriges socionomer</h2>
        <p>Vill ni synas för en relevant och yrkesinriktad målgrupp? Berätta om era rekryteringsbehov.</p>
      </div>
      <TrackedLink className="button button-secondary" eventName="employer_contact_click" href="/annonsera">
        Läs om annonsering <ArrowRightIcon />
      </TrackedLink>
    </aside>
  );
}
