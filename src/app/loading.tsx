export default function Loading() {
  return (
    <div className="site-container loading-state" aria-live="polite">
      <span className="loading-spinner" />
      <p>Hämtar aktuella jobb…</p>
    </div>
  );
}
