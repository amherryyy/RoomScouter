import type { Metadata } from "next";
import Link from "next/link";
import { DiscoveryFiltersForm } from "../../src/components/discovery-filters";
import { InteractiveListingMap, type MapListing } from "../../src/components/interactive-listing-map";
import { PublicHeader } from "../../src/components/public-header";
import { discoveryQuery, parseDiscoveryFilters } from "../../src/features/discovery/model";
import { loadDiscovery } from "../../src/features/discovery/queries";
import { getUniversityConfig } from "../../src/features/discovery/university";

export const metadata: Metadata = {
  title: "Room map | RoomScouter",
  description: "Explore approved, available RoomScouter listings on an interactive map.",
  robots: { index: false, follow: true },
};

const MAP_PAGE_SIZE = 50;

type MapPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MapPage({ searchParams }: MapPageProps) {
  const filters = parseDiscoveryFilters(await searchParams);
  const university = getUniversityConfig();
  const { results, facilities, utilities, barangays, total } = await loadDiscovery(filters, university, {
    pageSize: MAP_PAGE_SIZE,
    includeCovers: false,
  });
  const listings: MapListing[] = results.map((listing) => ({
    id: listing.id,
    title: listing.title,
    address_line: listing.address_line,
    barangay: listing.barangay,
    monthly_rent: listing.monthly_rent,
    room_type: listing.room_type,
    available_rooms: listing.available_rooms,
    latitude: listing.latitude,
    longitude: listing.longitude,
    approximate_distance_km: listing.approximate_distance_km,
  }));
  const firstResult = total ? (filters.page - 1) * MAP_PAGE_SIZE + 1 : 0;
  const lastResult = Math.min(filters.page * MAP_PAGE_SIZE, total);
  const hasPrevious = filters.page > 1;
  const hasNext = lastResult < total;
  const browseQuery = discoveryQuery(filters, 1);
  const browseHref = browseQuery ? `/browse?${browseQuery}` : "/browse";

  return (
    <main className="discovery-shell map-discovery-page" id="main-content" tabIndex={-1}>
      <PublicHeader current="map" />
      <section className="map-page-heading" aria-labelledby="map-page-title">
        <div>
          <p className="eyebrow">RoomScouter map</p>
          <h1 id="map-page-title">Explore available rooms nearby.</h1>
          <p>Move around the map, choose a price marker, or filter the approved listings below.</p>
        </div>
        <Link className="button secondary" href={browseHref}>Browse as a list</Link>
      </section>

      <section className="map-filter-section" aria-labelledby="map-filter-title">
        <div className="map-section-heading">
          <div>
            <p className="eyebrow">Find a closer match</p>
            <h2 id="map-filter-title">Search and filters</h2>
          </div>
          <p>These filters use the same public listing search as Browse.</p>
        </div>
        <DiscoveryFiltersForm
          action="/map"
          className="map-filter-panel"
          facilities={facilities}
          filters={filters}
          barangays={barangays}
          university={university}
          utilities={utilities}
        />
      </section>

      <section className="map-results-section" aria-labelledby="map-listings-heading">
        <div className="map-section-heading map-listings-heading">
          <div>
            <p className="eyebrow">Approved and available</p>
            <h2 id="map-listings-heading">{total ? `${firstResult}–${lastResult} of ${total} listings` : "No matching listings"}</h2>
          </div>
          <span>{total} {total === 1 ? "place" : "places"} found</span>
        </div>
        <InteractiveListingMap listings={listings} total={total} university={university} />
        {(hasPrevious || hasNext) ? (
          <nav className="pagination map-pagination" aria-label="Map results pages">
            {hasPrevious ? <Link className="button secondary" href={`/map?${discoveryQuery(filters, filters.page - 1)}`}>Previous</Link> : <span />}
            <span>Page {filters.page}</span>
            {hasNext ? <Link className="button secondary" href={`/map?${discoveryQuery(filters, filters.page + 1)}`}>Next</Link> : <span />}
          </nav>
        ) : null}
      </section>
    </main>
  );
}
