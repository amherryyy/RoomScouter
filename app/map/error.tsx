"use client";

import Link from "next/link";

export default function MapError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="map-route-error" id="main-content" tabIndex={-1}>
      <section className="map-error-card" role="alert" aria-labelledby="map-error-title">
        <p className="eyebrow">RoomScouter map</p>
        <h1 id="map-error-title">We couldn’t load the available listings.</h1>
        <p>Try again in a moment, or browse the listings while the map recovers.</p>
        <div className="map-error-actions">
          <button onClick={retry} type="button">Try again</button>
          <Link className="button secondary" href="/browse">Browse listings</Link>
        </div>
      </section>
    </main>
  );
}
