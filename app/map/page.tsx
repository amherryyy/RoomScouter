import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "../../src/components/public-header";
import { getUniversityConfig } from "../../src/features/discovery/university";

export const metadata: Metadata = {
  title: "Map preview | RoomScouter",
  description: "Preview the planned RoomScouter map experience.",
  robots: { index: false, follow: true },
};

export default function MapPreviewPage() {
  const university = getUniversityConfig();
  const campusMapUrl = university
    ? `https://www.openstreetmap.org/?mlat=${university.latitude}&mlon=${university.longitude}#map=16/${university.latitude}/${university.longitude}`
    : null;

  return (
    <main className="discovery-shell preview-page map-page" id="main-content" tabIndex={-1}>
      <PublicHeader current="map" />
      <section className="preview-hero">
        <p className="preview-badge">Under construction</p>
        <p className="eyebrow">Map preview</p>
        <h1>Explore nearby rooms visually.</h1>
        <p className="lede">
          The dedicated map is part of the approved RoomScouter wireframe. It will eventually show approved,
          available listings around the university without exposing unpublished owner information.
        </p>
        <div className="actions">
          <Link className="button" href="/browse">Browse available listings</Link>
          {campusMapUrl ? (
            <a className="button secondary" href={campusMapUrl} target="_blank" rel="noreferrer">
              View {university?.name} on OpenStreetMap
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          ) : null}
        </div>
      </section>

      <section className="map-preview-panel" aria-labelledby="map-preview-heading">
        <div className="map-preview-canvas" aria-hidden="true">
          <span className="map-campus-pin">University</span>
          <span className="map-property-pin map-property-one">Room</span>
          <span className="map-property-pin map-property-two">Room</span>
          <span className="map-property-pin map-property-three">Room</span>
        </div>
        <div className="preview-copy">
          <h2 id="map-preview-heading">What this page will support</h2>
          <ul className="preview-checklist">
            <li>Show only administrator-approved listings with available rooms.</li>
            <li>Keep search filters consistent with the main browse page.</li>
            <li>Compare approximate distance from the configured university.</li>
            <li>Remain usable with a keyboard and on smaller screens.</li>
          </ul>
          <p className="field-help">The map illustration is a wireframe preview, not an interactive map.</p>
        </div>
      </section>
    </main>
  );
}
