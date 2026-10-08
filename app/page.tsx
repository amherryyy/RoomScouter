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
  browseMode?: boolean;
};

export default async function Home({ searchParams, browseMode = false }: HomePageProps) {
  const filters = parseDiscoveryFilters(await searchParams);
  const university = getUniversityConfig();
  const { results, facilities, utilities, total } = await loadDiscovery(filters, university);
  const firstResult = total ? (filters.page - 1) * DISCOVERY_PAGE_SIZE + 1 : 0;
  const lastResult = Math.min(filters.page * DISCOVERY_PAGE_SIZE, total);
  const hasPrevious = filters.page > 1;
  const hasNext = lastResult < total;
  const searchPath = "/browse";
  const heroPhoto = results.find((listing) => listing.cover)?.cover ?? null;

  return (
    <main className={`discovery-shell${browseMode ? " browse-page-shell" : ""}`} id="main-content" tabIndex={-1}>
      <PublicHeader current={browseMode ? "browse" : "home"} />

      {browseMode ? (
        <section className="browse-page-hero">
          <p className="eyebrow">RoomScouter listings</p>
          <h1>Find a place that feels like yours.</h1>
          <p>Search verified boarding houses and compare real availability, rent, and amenities.</p>
          <Form className="hero-search" action={searchPath}>
            <label className="visually-hidden" htmlFor="hero-query">Search listings</label>
            <input id="hero-query" name="q" defaultValue={filters.query} maxLength={120} placeholder="Search location, area, or property name" />
            <SubmitButton pendingLabel="Searching…">Search</SubmitButton>
          </Form>
        </section>
      ) : (
      <section className="discovery-hero">
        <div className="discovery-hero-copy">
          <p className="eyebrow">Student housing near NVSU</p>
          <h1>Find your perfect boarding house.</h1>
          <p className="lede">Explore approved rooms around NVSU with clear details on rent, availability, amenities, and distance.</p>
          <Form className="hero-search" action={searchPath}>
            <label className="visually-hidden" htmlFor="hero-query">Search listings near the university</label>
            <input
              id="hero-query"
              name="q"
              defaultValue={filters.query}
              maxLength={120}
              placeholder="Search a property, street, or area"
            />
            <SubmitButton pendingLabel="Searching…">Find a room</SubmitButton>
          </Form>
          <div className="quick-searches" aria-label="Quick searches">
            <span>Popular:</span>
            <Link href="/browse?maximumRent=5000">Up to ₱5,000</Link>
            <Link href="/browse?roomType=private_room">Private rooms</Link>
            {university ? <Link href="/browse?maximumDistance=1">Within 1 km</Link> : null}
          </div>
        </div>
        <div className={`discovery-hero-visual${heroPhoto ? " has-hero-photo" : ""}`}>
          {heroPhoto ? (
            <img className="hero-property-photo" src={heroPhoto.signedUrl} alt={heroPhoto.altText} />
          ) : (
            <div className="hero-brand-art" aria-hidden="true">
              <img src="/roomscouter-icon.jpg" alt="" width="1692" height="2046" />
              <span>Local homes, easier to compare</span>
            </div>
          )}
          {heroPhoto ? (
            <div className="hero-location-card">
              <span>Explore homes near</span>
              <strong>{university?.name ?? "Nueva Vizcaya State University"}</strong>
            </div>
          ) : null}
        </div>
      </section>
      )}

      {!browseMode ? (
        <section className="featured-listings" aria-labelledby="featured-title">
          <div className="discovery-section-heading">
            <div>
              <p className="eyebrow">Places to start</p>
              <h2 id="featured-title">Available boarding houses</h2>
            </div>
            <Link className="text-link" href="/browse">See all listings <span aria-hidden="true">→</span></Link>
          </div>
          {results.length ? <div className="featured-grid">
            {results.slice(0, 3).map((listing) => (
              <article className="featured-card" key={listing.id}>
                <Link className="featured-cover-link" href={`/listings/${listing.id}`} aria-label={`View ${listing.title}`}>
                  {listing.cover ? <img className="featured-cover" src={listing.cover.signedUrl} alt={listing.cover.altText} /> : <span className="featured-cover featured-cover-empty"><img src="/icon.jpg" width="1692" height="2046" alt="" /><span>Photos coming soon</span></span>}
                </Link>
                <div className="featured-card-body">
                  <p className="featured-location">{listing.address_line}</p>
                  <h3><Link href={`/listings/${listing.id}`}>{listing.title}</Link></h3>
                  <p className="featured-location">{ROOM_TYPE_LABELS[listing.room_type]} · {listing.available_rooms} available</p>
                  <p className="listing-price"><strong>{currency.format(listing.monthly_rent)}</strong> <span>per month</span></p>
                </div>
              </article>
            ))}
          </div> : <div className="empty-state"><h3>No available homes yet</h3><p>Check back soon, or browse again when more local listings are approved.</p></div>}
        </section>
      ) : null}

      {browseMode ? <section className="discovery-browser browse-results-section" id="browse" aria-labelledby="browse-title">
        <div className="discovery-section-heading">
          <div>
            <p className="eyebrow">Browse local options</p>
            <h2 id="browse-title">{browseMode ? "Available boarding houses" : "Refine your search"}</h2>
          </div>
          <p>{browseMode ? `${total} approved ${total === 1 ? "listing" : "listings"} available to explore` : "Every public result has passed administrator review."}</p>
        </div>
      <div className={browseMode ? "browse-results-layout" : undefined}>
      <Form className={`discovery-filters${browseMode ? " browse-filter-panel" : ""}`} action={searchPath} aria-label="Filter boarding houses">
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
          <Link className="button secondary" href={searchPath}>Clear</Link>
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
              ) : <div className="listing-cover cover-placeholder"><img src="/roomscouter-icon.jpg" width="1692" height="2046" alt="" /><span>Photo coming soon</span></div>}
              <div className="discovery-card-body">
                <div className="listing-card-heading">
                  <h3><Link href={`/listings/${listing.id}`}>{listing.title}</Link></h3>
                  <span className="availability-badge">Available</span>
                </div>
                <p className="listing-address">{listing.address_line}</p>
                <p className="listing-price"><strong>{currency.format(listing.monthly_rent)}</strong> <span>per month</span></p>
                <div className="fact-row">
                  <span>{ROOM_TYPE_LABELS[listing.room_type]}</span>
                  <span>{listing.available_rooms} available</span>
                  {listing.approximate_distance_km !== null ? <span>About {listing.approximate_distance_km} km</span> : null}
                </div>
                <Link className="card-detail-link" href={`/listings/${listing.id}`}>View listing details <span aria-hidden="true">→</span></Link>
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
          {hasPrevious ? <Link className="button secondary" href={`${searchPath}?${discoveryQuery(filters, filters.page - 1)}`}>Previous</Link> : <span />}
          <span>Page {filters.page}</span>
          {hasNext ? <Link className="button secondary" href={`${searchPath}?${discoveryQuery(filters, filters.page + 1)}`}>Next</Link> : <span />}
        </nav>
      ) : null}
      </div>
      </section> : null}
    </main>
  );
}
