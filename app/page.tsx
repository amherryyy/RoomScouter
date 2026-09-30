import Link from "next/link";
import Form from "next/form";
import { PublicHeader } from "../src/components/public-header";
import { SubmitButton } from "../src/components/submit-button";
import { loadDiscovery } from "../src/features/discovery/queries";
import {
  DISCOVERY_PAGE_SIZE,
  discoveryQuery,
  parseDiscoveryFilters,
  ROOM_TYPE_LABELS,
  ROOM_TYPES,
} from "../src/features/discovery/model";
import { getUniversityConfig } from "../src/features/discovery/university";

const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const filters = parseDiscoveryFilters(await searchParams);
  const university = getUniversityConfig();
  const { results, facilities, utilities, total } = await loadDiscovery(filters, university);
  const firstResult = total ? (filters.page - 1) * DISCOVERY_PAGE_SIZE + 1 : 0;
  const lastResult = Math.min(filters.page * DISCOVERY_PAGE_SIZE, total);
  const hasPrevious = filters.page > 1;
  const hasNext = lastResult < total;

  return (
    <main className="discovery-shell" id="main-content" tabIndex={-1}>
      <PublicHeader current="home" />

      <section className="discovery-hero">
        <p className="eyebrow">Verified local options</p>
        <h1>Find a boarding house that fits student life.</h1>
        <p className="lede">Search approved listings and compare rent, availability, facilities, utilities, and location.</p>
      </section>

      <Form className="discovery-filters" id="browse" action="/" aria-label="Filter boarding houses">
        <div className="search-field">
          <label htmlFor="q">Search by name, address, or description</label>
          <input id="q" name="q" defaultValue={filters.query} maxLength={120} placeholder="Try a street or neighborhood" />
        </div>
        <div>
          <label htmlFor="maximumRent">Maximum monthly rent</label>
          <input id="maximumRent" name="maximumRent" type="number" min="0" max="1000000" step="100" defaultValue={filters.maximumRent ?? ""} />
        </div>
        <div>
          <label htmlFor="minimumRooms">Rooms needed</label>
          <input id="minimumRooms" name="minimumRooms" type="number" min="1" max="1000" defaultValue={filters.minimumRooms} />
        </div>
        <div>
          <label htmlFor="roomType">Room type</label>
          <select id="roomType" name="roomType" defaultValue={filters.roomType ?? ""}>
            <option value="">Any room type</option>
            {ROOM_TYPES.map((type) => <option value={type} key={type}>{ROOM_TYPE_LABELS[type]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="facility">Facility</label>
          <select id="facility" name="facility" defaultValue={filters.facilityId ?? ""}>
            <option value="">Any facility</option>
            {facilities.map((facility) => <option value={facility.id} key={facility.id}>{facility.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="utility">Utility</label>
          <select id="utility" name="utility" defaultValue={filters.utilityId ?? ""}>
            <option value="">Any utility</option>
            {utilities.map((utility) => <option value={utility.id} key={utility.id}>{utility.name}</option>)}
          </select>
        </div>
        {university ? (
          <div>
            <label htmlFor="maximumDistance">Maximum distance from {university.name}</label>
            <select id="maximumDistance" name="maximumDistance" defaultValue={filters.maximumDistanceKm ?? ""}>
              <option value="">Any distance</option>
              {[1, 2, 5, 10, 20].map((distance) => <option value={distance} key={distance}>{distance} km</option>)}
            </select>
          </div>
        ) : null}
        <div className="filter-actions">
          <SubmitButton pendingLabel="Searching…">Show listings</SubmitButton>
          <Link className="button secondary" href="/">Clear</Link>
        </div>
      </Form>

      <div className="results-heading" aria-live="polite">
        <div>
          <p className="eyebrow">Public listings</p>
          <h2>{total ? `${firstResult}–${lastResult} of ${total}` : "No matches yet"}</h2>
        </div>
        {!university ? <p className="configuration-note">Distance filtering becomes available when the university is configured.</p> : null}
      </div>

      {results.length ? (
        <div className="discovery-grid">
          {results.map((listing) => (
            <article className="discovery-card" key={listing.id}>
              {listing.cover ? (
                <img className="listing-cover" src={listing.cover.signedUrl} alt={listing.cover.altText} />
              ) : <div className="listing-cover cover-placeholder">Photo coming soon</div>}
              <div className="discovery-card-body">
                <div className="listing-card-heading">
                  <h3><Link href={`/listings/${listing.id}`}>{listing.title}</Link></h3>
                  <strong>{currency.format(listing.monthly_rent)}</strong>
                </div>
                <p>{listing.address_line}</p>
                <div className="fact-row">
                  <span>{ROOM_TYPE_LABELS[listing.room_type]}</span>
                  <span>{listing.available_rooms} available</span>
                  {listing.approximate_distance_km !== null ? <span>About {listing.approximate_distance_km} km</span> : null}
                </div>
                <Link href={`/listings/${listing.id}`}>View listing details</Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="empty-state">
          <h2>No listings match those filters</h2>
          <p>Try a broader search, a higher rent limit, or fewer required rooms.</p>
        </section>
      )}

      {(hasPrevious || hasNext) ? (
        <nav className="pagination" aria-label="Search results pages">
          {hasPrevious ? <Link className="button secondary" href={`/?${discoveryQuery(filters, filters.page - 1)}`}>Previous</Link> : <span />}
          <span>Page {filters.page}</span>
          {hasNext ? <Link className="button secondary" href={`/?${discoveryQuery(filters, filters.page + 1)}`}>Next</Link> : <span />}
        </nav>
      ) : null}
    </main>
  );
}
