import Image from "next/image";
import nvsuCampusImage from "../logo&icon/nvsu.jpg";
import Link from "next/link";
import Form from "next/form";
import { PublicHeader } from "../src/components/public-header";
import { UiIcon } from "../src/components/ui-icon";
import { DiscoveryFiltersForm } from "../src/components/discovery-filters";
import { SubmitButton } from "../src/components/submit-button";
import { loadDiscovery } from "../src/features/discovery/queries";
import {
  DISCOVERY_PAGE_SIZE,
  discoveryQuery,
  parseDiscoveryFilters,
  ROOM_TYPE_LABELS,
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
  const { results, facilities, utilities, barangays, total } = await loadDiscovery(filters, university);
  const firstResult = total ? (filters.page - 1) * DISCOVERY_PAGE_SIZE + 1 : 0;
  const lastResult = Math.min(filters.page * DISCOVERY_PAGE_SIZE, total);
  const hasPrevious = filters.page > 1;
  const hasNext = lastResult < total;
  const searchPath = "/browse";

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
          <Form className="hero-search home-hero-search" action={searchPath}>
            <label className="visually-hidden" htmlFor="hero-query">Search listings near the university</label>
            <input
              id="hero-query"
              name="q"
              defaultValue={filters.query}
              maxLength={120}
              placeholder="Search a property, street, or area"
            />
            <SubmitButton pendingLabel="Searching…">Find a room</SubmitButton>
            <Link className="button secondary home-get-started" href="/register"><UiIcon className="ui-icon" name="user-plus" /><span>Get started</span></Link>
          </Form>
          <div className="quick-searches" aria-label="Quick searches">
            <span>Popular:</span>
            <Link href="/browse?maximumRent=5000">Up to ₱5,000</Link>
            <Link href="/browse?roomType=private_room">Private rooms</Link>
            {university ? <Link href="/browse?maximumDistance=1">Within 1 km</Link> : null}
          </div>
        </div>
        <div className="discovery-hero-visual has-hero-photo">
          <Image
            className="hero-property-photo"
            src={nvsuCampusImage}
            alt="Nueva Vizcaya State University Bayombong Campus"
            fill
            preload
            sizes="(max-width: 900px) 100vw, 45vw"
          />
          <div className="hero-location-card">
            <span>Explore homes near</span>
            <strong>Nueva Vizcaya State University Bayombong Campus</strong>
          </div>
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
              <Link className="featured-card" href={`/listings/${listing.id}`} aria-label={`View property details for ${listing.title}`} key={listing.id}>
                {listing.cover ? <img className="featured-cover" src={listing.cover.signedUrl} alt={listing.cover.altText} /> : <span className="featured-cover featured-cover-empty"><img src="/roomscouter-icon.png" width="1141" height="1379" alt="" /><span>Photos coming soon</span></span>}
                <div className="featured-card-body">
                  <p className="featured-location">{listing.barangay ? `${listing.barangay} · ` : ""}{listing.address_line}</p>
                  <h3>{listing.title}</h3>
                  <p className="featured-location">{ROOM_TYPE_LABELS[listing.room_type]} · {listing.available_rooms} available</p>
                  <p className="listing-price"><strong>{currency.format(listing.monthly_rent)}</strong> <span>per month</span></p>
                </div>
              </Link>
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
          {browseMode ? (
            <Link className="button secondary" href={`/map${discoveryQuery(filters, 1) ? `?${discoveryQuery(filters, 1)}` : ""}`}>
              View map
            </Link>
          ) : null}
        </div>
      <div className={browseMode ? "browse-results-layout" : undefined}>
        <DiscoveryFiltersForm
          action={searchPath}
          className={browseMode ? "browse-filter-panel" : ""}
          facilities={facilities}
          filters={filters}
          barangays={barangays}
          university={university}
          utilities={utilities}
        />


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
            <Link className="discovery-card" href={`/listings/${listing.id}`} aria-label={`View property details for ${listing.title}`} key={listing.id}>
              {listing.cover ? (
                <img className="listing-cover" src={listing.cover.signedUrl} alt={listing.cover.altText} />
              ) : <div className="listing-cover cover-placeholder"><img src="/roomscouter-icon.png" width="1141" height="1379" alt="" /><span>Photo coming soon</span></div>}
              <div className="discovery-card-body">
                <div className="listing-card-heading">
                  <h3>{listing.title}</h3>
                  <span className="availability-badge">Available</span>
                </div>
                <p className="listing-address">{listing.barangay ? `${listing.barangay} · ` : ""}{listing.address_line}</p>
                <p className="listing-price"><strong>{currency.format(listing.monthly_rent)}</strong> <span>per month</span></p>
                <div className="fact-row">
                  <span>{ROOM_TYPE_LABELS[listing.room_type]}</span>
                  <span>{listing.available_rooms} available</span>
                  {listing.approximate_distance_km !== null ? <span>About {listing.approximate_distance_km} km</span> : null}
                </div>
                <span className="card-detail-link" aria-hidden="true">View listing details <span aria-hidden="true">→</span></span>
              </div>
            </Link>
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

      {!browseMode ? (
        <section className="home-developer-note" aria-labelledby="developers-title">
          <div>
            <p className="eyebrow">Built for the NVSU community</p>
            <h2 id="developers-title">About the developers</h2>
            <p>RoomScouter is a community-focused project. Need help or spotted an issue? Send a message to the developers.</p>
            <p className="home-developer-privacy">Messages open as public GitHub issues. Leave out passwords, account details, and private rental information.</p>
          </div>
          <div className="home-developer-actions">
            <Link className="button" href="/contact?type=contact"><UiIcon className="ui-icon" name="mail" /> Contact developers</Link>
            <a className="button secondary" href="https://github.com/amherryyy/RoomScouter"><UiIcon className="ui-icon" name="github" /> View on GitHub</a>
          </div>
        </section>
      ) : null}
    </main>
  );
}
