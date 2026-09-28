import Link from "next/link";
import { notFound } from "next/navigation";
import { ROOM_TYPE_LABELS } from "../../../src/features/discovery/model";
import { approximateDistanceKm, getUniversityConfig } from "../../../src/features/discovery/university";
import { addFavorite, removeFavorite } from "../../../src/features/favorites/actions";
import { isUuid } from "../../../src/features/listings/model";
import { createServerSupabaseClient } from "../../../src/lib/supabase/server";

const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });

type PublicListingPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function PublicListingPage({ params, searchParams }: PublicListingPageProps) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const supabase = await createServerSupabaseClient();
  const { data: listing } = await supabase.from("boarding_houses").select("*").eq("id", id).maybeSingle();
  if (!listing || listing.status !== "approved" || listing.available_rooms < 1) notFound();
  const { error, message } = await searchParams;
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };
  const { data: favorite } = user && profile?.role === "student"
    ? await supabase
      .from("favorites")
      .select("boarding_house_id")
      .eq("student_id", user.id)
      .eq("boarding_house_id", id)
      .maybeSingle()
    : { data: null };

  const [
    { data: photos },
    { data: facilityLinks },
    { data: utilityLinks },
    { data: rules },
    { data: facilities },
    { data: utilities },
  ] = await Promise.all([
    supabase.from("listing_photos").select("id, object_path, alt_text, position").eq("boarding_house_id", id).order("position"),
    supabase.from("boarding_house_facilities").select("facility_id").eq("boarding_house_id", id),
    supabase.from("boarding_house_utilities").select("utility_id, is_included, details").eq("boarding_house_id", id),
    supabase.from("house_rules").select("id, rule_text, position").eq("boarding_house_id", id).order("position"),
    supabase.from("facilities").select("id, name").order("name"),
    supabase.from("utilities").select("id, name").order("name"),
  ]);
  const photoGallery = await Promise.all((photos ?? []).map(async (photo) => {
    const { data } = await supabase.storage.from("listing-photos").createSignedUrl(photo.object_path, 60 * 60);
    return { ...photo, signedUrl: data?.signedUrl ?? null };
  }));
  const facilityIds = new Set((facilityLinks ?? []).map((link) => link.facility_id));
  const facilityNames = (facilities ?? []).filter((facility) => facilityIds.has(facility.id)).map((facility) => facility.name);
  const utilityCatalog = new Map((utilities ?? []).map((utility) => [utility.id, utility.name]));
  const university = getUniversityConfig();
  const distance = university
    ? approximateDistanceKm(university.latitude, university.longitude, listing.latitude, listing.longitude)
    : null;
  const mapUrl = `https://www.openstreetmap.org/?mlat=${listing.latitude}&mlon=${listing.longitude}#map=17/${listing.latitude}/${listing.longitude}`;

  return (
    <main className="public-detail-shell">
      <header className="public-header">
        <Link className="wordmark" href="/">RoomScouter</Link>
        <nav aria-label="Listing navigation"><Link href="/">Back to search</Link></nav>
      </header>

      <section className="detail-heading">
        <div>
          <p className="eyebrow">Approved listing</p>
          <h1>{listing.title}</h1>
          <p className="lede">{listing.address_line}</p>
        </div>
        <div className="price-panel">
          <strong>{currency.format(listing.monthly_rent)}</strong>
          <span>per month</span>
        </div>
      </section>

      {error ? <p className="notice error" role="alert">{error}</p> : null}
      {message ? <p className="notice success" role="status">{message}</p> : null}

      {photoGallery.length ? (
        <section className="public-photo-grid" aria-label="Listing photos">
          {photoGallery.map((photo) => photo.signedUrl
            ? <img src={photo.signedUrl} alt={photo.alt_text} key={photo.id} />
            : null)}
        </section>
      ) : null}

      <div className="detail-layout">
        <article className="detail-content">
          <section>
            <h2>At a glance</h2>
            <dl className="fact-list">
              <div><dt>Room type</dt><dd>{ROOM_TYPE_LABELS[listing.room_type]}</dd></div>
              <div><dt>Available rooms</dt><dd>{listing.available_rooms}</dd></div>
              {distance !== null && university ? <div><dt>Distance from {university.name}</dt><dd>About {distance.toFixed(2)} km straight-line</dd></div> : null}
            </dl>
          </section>
          <section><h2>About this boarding house</h2><p className="long-copy">{listing.description}</p></section>
          {facilityNames.length ? <section><h2>Facilities</h2><ul className="tag-list">{facilityNames.map((name) => <li key={name}>{name}</li>)}</ul></section> : null}
          {(utilityLinks ?? []).length ? (
            <section>
              <h2>Utilities</h2>
              <ul className="detail-list">{(utilityLinks ?? []).map((utility) => (
                <li key={utility.utility_id}>
                  <strong>{utilityCatalog.get(utility.utility_id) ?? "Utility"}</strong>
                  <span>{utility.is_included ? "Included in rent" : "Not included in rent"}{utility.details ? ` · ${utility.details}` : ""}</span>
                </li>
              ))}</ul>
            </section>
          ) : null}
          {(rules ?? []).length ? <section><h2>House rules</h2><ol className="detail-list">{(rules ?? []).map((rule) => <li key={rule.id}>{rule.rule_text}</li>)}</ol></section> : null}
        </article>

        <aside className="contact-card">
          {profile?.role === "student" ? (
            <form action={favorite ? removeFavorite.bind(null, id) : addFavorite.bind(null, id)}>
              <button className={favorite ? "secondary favorite-button" : "favorite-button"} type="submit">
                {favorite ? "Remove from saved listings" : "Save listing"}
              </button>
            </form>
          ) : !user ? <p><Link href="/login">Log in as a student to save this listing</Link></p> : null}
          <h2>Location and contact</h2>
          <p>{listing.address_line}</p>
          <p><a href={mapUrl} target="_blank" rel="noreferrer">View exact pin on OpenStreetMap</a></p>
          <hr />
          <p><strong>{listing.contact_name}</strong></p>
          {listing.contact_phone ? <p><a href={`tel:${listing.contact_phone}`}>{listing.contact_phone}</a></p> : null}
          {listing.contact_email ? <p><a href={`mailto:${listing.contact_email}`}>{listing.contact_email}</a></p> : null}
          <p className="field-help">Contact the owner directly. RoomScouter does not process reservations or payments.</p>
        </aside>
      </div>
    </main>
  );
}
