import Link from "next/link";
import { notFound } from "next/navigation";
import { isUuid } from "../../../../src/features/listings/model";
import { requireAdmin } from "../../../../src/features/moderation/access";
import { ListingControls } from "../../../../src/features/moderation/listing-controls";

const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });
const dateFormatter = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" });

type AdminListingPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function AdminListingPage({ params, searchParams }: AdminListingPageProps) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data: listing } = await supabase.from("boarding_houses").select("*").eq("id", id).maybeSingle();
  if (!listing) notFound();

  const [
    { data: owner },
    { data: facilities },
    { data: utilities },
    { data: rules },
    { data: photos },
    { data: events },
  ] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", listing.owner_id).maybeSingle(),
    supabase.from("boarding_house_facilities").select("facilities(name)").eq("boarding_house_id", id),
    supabase.from("boarding_house_utilities").select("is_included, details, utilities(name)").eq("boarding_house_id", id),
    supabase.from("house_rules").select("id, rule_text, position").eq("boarding_house_id", id).order("position"),
    supabase.from("listing_photos").select("id, object_path, alt_text, position").eq("boarding_house_id", id).order("position"),
    supabase.from("moderation_events").select("id, action, reason, created_at").eq("boarding_house_id", id).order("created_at", { ascending: false }),
  ]);
  const photosWithUrls = await Promise.all((photos ?? []).map(async (photo) => {
    const { data } = await supabase.storage.from("listing-photos").createSignedUrl(photo.object_path, 60 * 60);
    return { ...photo, signedUrl: data?.signedUrl ?? null };
  }));
  const { error, message } = await searchParams;

  return (
    <main className="workspace-shell moderation-detail" id="main-content" tabIndex={-1}>
      <header className="detail-heading">
        <div>
          <p className="eyebrow">Administrator review</p>
          <h1>{listing.title}</h1>
          <p>{listing.address_line}</p>
          <p>Barangay: {listing.barangay || "Not provided"}</p>
        </div>
        <span className={`status status-${listing.status}`}>{listing.status}</span>
      </header>
      {error ? <p className="notice error" role="alert">{error}</p> : null}
      {message ? <p className="notice success" role="status">{message}</p> : null}

      <div className="moderation-detail-layout">
        <div className="moderation-review-content">
          <section>
            <h2>Listing facts</h2>
            <dl className="fact-list">
              <div><dt>Owner</dt><dd>{owner?.display_name ?? "Unknown owner"}</dd></div>
              <div><dt>Monthly rent</dt><dd>{currency.format(listing.monthly_rent)}</dd></div>
              <div><dt>Room type</dt><dd>{listing.room_type.replaceAll("_", " ")}</dd></div>
              <div><dt>Available rooms</dt><dd>{listing.available_rooms}</dd></div>
              <div><dt>Coordinates</dt><dd>{listing.latitude}, {listing.longitude}</dd></div>
              <div><dt>Submitted</dt><dd>{listing.submitted_at ? dateFormatter.format(new Date(listing.submitted_at)) : "Not submitted"}</dd></div>
            </dl>
          </section>
          <section><h2>Description</h2><p className="long-copy">{listing.description}</p></section>
          <section>
            <h2>Contact details</h2>
            <p>{listing.contact_name}</p>
            <p>{listing.contact_phone ?? "No phone provided"} · {listing.contact_email ?? "No email provided"}</p>
          </section>
          <section>
            <h2>Facilities</h2>
            <ul className="tag-list">{facilities?.length ? facilities.map((item, index) => <li key={index}>{item.facilities?.name}</li>) : <li>None selected</li>}</ul>
          </section>
          <section>
            <h2>Utilities</h2>
            <ul className="detail-list">{utilities?.length ? utilities.map((item, index) => <li key={index}><strong>{item.utilities?.name}</strong><span>{item.is_included ? "Included in rent" : "Paid separately"}{item.details ? ` · ${item.details}` : ""}</span></li>) : <li>None selected</li>}</ul>
          </section>
          <section>
            <h2>House rules</h2>
            <ol>{rules?.length ? rules.map((rule) => <li key={rule.id}>{rule.rule_text}</li>) : <li>No rules provided</li>}</ol>
          </section>
          <section>
            <h2>Photos</h2>
            {photosWithUrls.length ? <div className="public-photo-grid">{photosWithUrls.map((photo) => photo.signedUrl ? <img key={photo.id} src={photo.signedUrl} alt={photo.alt_text} /> : null)}</div> : <p>No photos uploaded.</p>}
          </section>
          <section>
            <h2>Decision history</h2>
            {events?.length ? <ol className="moderation-event-list">{events.map((event) => <li key={event.id}><strong>{event.action}</strong> · {dateFormatter.format(new Date(event.created_at))}{event.reason ? <p>{event.reason}</p> : null}</li>)}</ol> : <p>No previous decisions.</p>}
          </section>
        </div>
        <ListingControls listingId={listing.id} status={listing.status} />
      </div>
      <p><Link href={`/admin?state=${listing.status === "approved" ? "approved" : "pending"}`}>Back to listing moderation</Link></p>
    </main>
  );
}
