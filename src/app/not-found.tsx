import Link from "next/link";

export default function NotFound() {
  return (
    <div className="site-container not-found">
      <div>
        <span className="not-found-mark">404</span>
        <h1>Sidan kunde inte hittas</h1>
        <p>Länken kan vara gammal eller så har jobbannonsen tagits bort. Du kan fortsätta bland de jobb som är aktuella nu.</p>
        <Link className="button button-primary" href="/lediga-jobb">Visa lediga jobb</Link>
      </div>
    </div>
  );
}
