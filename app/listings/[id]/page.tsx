import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "../../../src/components/public-header";
import { SubmitButton } from "../../../src/components/submit-button";
import { ROOM_TYPE_LABELS } from "../../../src/features/discovery/model";
import { approximateDistanceKm, getUniversityConfig } from "../../../src/features/discovery/university";
import { addFavorite, removeFavorite } from "../../../src/features/favorites/actions";
import { isUuid } from "../../../src/features/listings/model";
import { deleteReview, saveReview } from "../../../src/features/reviews/actions";
import { ReviewSection } from "../../../src/features/reviews/review-section";
import { reportListing, reportReview } from "../../../src/features/reports/actions";
import { ReportForm } from "../../../src/features/reports/report-form";
import { createServerSupabaseClient } from "../../../src/lib/supabase/server";

const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });
const REVIEW_PAGE_SIZE = 10;

type PublicListingPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string; reviewPage?: string }>;
};

export default async function PublicListingPage({ params, searchParams }: PublicListingPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  if (!isUuid(id)) notFound();
  const { error, message, reviewPage: rawReviewPage } = query;
  const parsedReviewPage = Number(rawReviewPage ?? "1");
  const reviewPage = Number.isInteger(parsedReviewPage) && parsedReviewPage > 0 && parsedReviewPage <= 10_000
    ? parsedReviewPage
    : 1;
  const supabase = await createServerSupabaseClient();
  const [
    { data: listing },
    { data: { user } },
    { data: photos },
    { data: facilityLinks },
    { data: utilityLinks },
    { data: rules },
    { data: facilities },
    { data: utilities },
    { data: publicReviewRows },
    { data: reviewSummaryRows },
  ] = await Promise.all([
    supabase.from("boarding_houses").select("*").eq("id", id).maybeSingle(),
    supabase.auth.getUser(),
    supabase.from("listing_photos").select("id, object_path, alt_text, position").eq("boarding_house_id", id).order("position"),
    supabase.from("boarding_house_facilities").select("facility_id").eq("boarding_house_id", id),
    supabase.from("boarding_house_utilities").select("utility_id, is_included, details").eq("boarding_house_id", id),
    supabase.from("house_rules").select("id, rule_text, position").eq("boarding_house_id", id).order("position"),
    supabase.from("facilities").select("id, name").order("name"),
    supabase.from("utilities").select("id, name").order("name"),
    supabase
      .from("public_reviews")
      .select("id, rating, comment, created_at")
      .eq("boarding_house_id", id)
      .order("created_at", { ascending: false })
      .range((reviewPage - 1) * REVIEW_PAGE_SIZE, reviewPage * REVIEW_PAGE_SIZE - 1),
    supabase.rpc("get_public_review_summary", { target_id: id }),
  ]);
  if (!listing || listing.status !== "approved" || listing.available_rooms < 1) notFound();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };
  const [{ data: favorite }, { data: ownReviewRows }] = user && profile?.role === "student"
    ? await Promise.all([
      supabase
        .from("favorites")
        .select("boarding_house_id")
        .eq("student_id", user.id)
        .eq("boarding_house_id", id)
        .maybeSingle(),
      supabase.rpc("get_current_student_review", { target_id: id }),
    ])
    : [{ data: null }, { data: [] }];

  const storedPhotos = photos ?? [];
  const { data: signedPhotos } = storedPhotos.length
    ? await supabase.storage
      .from("listing-photos")
      .createSignedUrls(storedPhotos.map((photo) => photo.object_path), 60 * 60)
    : { data: [] };
  const signedUrls = new Map(
    (signedPhotos ?? []).flatMap((photo) => photo.signedUrl ? [[photo.path, photo.signedUrl] as const] : []),
  );
  const photoGallery = storedPhotos.map((photo) => ({
    ...photo,
    signedUrl: signedUrls.get(photo.object_path) ?? null,
  }));
  const facilityIds = new Set((facilityLinks ?? []).map((link) => link.facility_id));
  const facilityNames = (facilities ?? []).filter((facility) => facilityIds.has(facility.id)).map((facility) => facility.name);
  const utilityCatalog = new Map((utilities ?? []).map((utility) => [utility.id, utility.name]));
  const university = getUniversityConfig();
  const distance = university
    ? approximateDistanceKm(university.latitude, university.longitude, listing.latitude, listing.longitude)
    : null;
  const mapUrl = `https://www.openstreetmap.org/?mlat=${listing.latitude}&mlon=${listing.longitude}#map=17/${listing.latitude}/${listing.longitude}`;
  const publicReviews = (publicReviewRows ?? []).flatMap((review) => (
    review.id && review.rating !== null && review.comment && review.created_at
      ? [{ id: review.id, rating: review.rating, comment: review.comment, createdAt: review.created_at }]
      : []
  ));
  const ownReviewRow = ownReviewRows?.[0];
  const ownReview = ownReviewRow ? {
    id: ownReviewRow.id,
    rating: ownReviewRow.rating,
    comment: ownReviewRow.comment,
    status: ownReviewRow.status,
    moderationNote: ownReviewRow.moderation_note,
  } : null;
  const reviewSummary = reviewSummaryRows?.[0];
  const reviewCount = Number(reviewSummary?.review_count ?? 0);
  const averageRating = reviewSummary?.average_rating === null || reviewSummary?.average_rating === undefined
    ? null
    : Number(reviewSummary.average_rating);
  const saveReviewAction = saveReview.bind(null, id);
  const deleteReviewAction = deleteReview.bind(null, id);
  const reportListingAction = reportListing.bind(null, id);
  const reportReviewAction = reportReview.bind(null, id);

  return (
    <main className="public-detail-shell" id="main-content" tabIndex={-1}>
      <PublicHeader current="browse" />

      <nav className="detail-breadcrumb" aria-label="Breadcrumb">
        <Link href="/#browse">Browse listings</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Property details</span>
      </nav>

      <section className="detail-heading">
        <div>
          <p className="eyebrow detail-status">Approved listing</p>
          <h1>{listing.title}</h1>
          <p className="detail-address">{listing.address_line}</p>
          <ul className="detail-meta" aria-label="Listing summary">
            {listing.barangay ? <li>Barangay {listing.barangay}</li> : null}
            <li>{ROOM_TYPE_LABELS[listing.room_type]}</li>
            <li>{listing.available_rooms} {listing.available_rooms === 1 ? "room" : "rooms"} available</li>
            {distance !== null && university ? <li>About {distance.toFixed(2)} km from {university.name}</li> : null}
          </ul>
        </div>
        <div className="price-panel">
          <span className="price-label">Monthly rent</span>
          <strong>{currency.format(listing.monthly_rent)}</strong>
          <span>per month, paid to the owner</span>
        </div>
      </section>

      {error ? <p className="notice error" role="alert">{error}</p> : null}
      {message ? <p className="notice success" role="status">{message}</p> : null}

      {photoGallery.some((photo) => photo.signedUrl) ? (
        <section className={`public-photo-grid listing-gallery listing-gallery-count-${Math.min(photoGallery.filter((photo) => photo.signedUrl).length, 4)}`} aria-label="Listing photos">
          {photoGallery.map((photo) => photo.signedUrl
            ? <img src={photo.signedUrl} alt={photo.alt_text} key={photo.id} />
            : null)}
        </section>
      ) : (
        <div className="listing-gallery-empty" role="img" aria-label="No property photos provided">
          <p>No property photos provided</p>
        </div>
      )}

      <div className="detail-layout">
        <article className="detail-content">
          <section className="detail-content-section detail-overview">
            <p className="section-kicker">The essentials</p>
            <h2>At a glance</h2>
            <dl className="fact-list">
              <div><dt>Room type</dt><dd>{ROOM_TYPE_LABELS[listing.room_type]}</dd></div>
              <div><dt>Available rooms</dt><dd>{listing.available_rooms}</dd></div>
              {listing.barangay ? <div><dt>Barangay</dt><dd>{listing.barangay}</dd></div> : null}
              {distance !== null && university ? <div><dt>Distance from {university.name}</dt><dd>About {distance.toFixed(2)} km straight-line</dd></div> : null}
            </dl>
          </section>
          <section className="detail-content-section"><p className="section-kicker">About the property</p><h2>About this boarding house</h2><p className="long-copy">{listing.description}</p></section>
          {facilityNames.length ? <section className="detail-content-section"><p className="section-kicker">Available features</p><h2>Facilities</h2><ul className="tag-list">{facilityNames.map((name) => <li key={name}>{name}</li>)}</ul></section> : null}
          {(utilityLinks ?? []).length ? (
            <section className="detail-content-section">
              <p className="section-kicker">Monthly costs</p>
              <h2>Utilities</h2>
              <ul className="detail-list">{(utilityLinks ?? []).map((utility) => (
                <li key={utility.utility_id}>
                  <strong>{utilityCatalog.get(utility.utility_id) ?? "Utility"}</strong>
                  <span>{utility.is_included ? "Included in rent" : "Not included in rent"}{utility.details ? ` · ${utility.details}` : ""}</span>
                </li>
              ))}</ul>
            </section>
          ) : null}
          {(rules ?? []).length ? <section className="detail-content-section"><p className="section-kicker">Before you visit</p><h2>House rules</h2><ol className="detail-list">{(rules ?? []).map((rule) => <li key={rule.id}>{rule.rule_text}</li>)}</ol></section> : null}
        </article>

        <aside className="contact-card listing-contact-card">
          {profile?.role === "student" ? (
            <form action={favorite ? removeFavorite.bind(null, id) : addFavorite.bind(null, id)}>
              <SubmitButton
                className={favorite ? "secondary favorite-button" : "favorite-button"}
                pendingLabel={favorite ? "Removing saved listing…" : "Saving listing…"}
              >
                {favorite ? "Remove from saved listings" : "Save listing"}
              </SubmitButton>
            </form>
          ) : !user ? <p><Link href="/login">Log in as a student to save this listing</Link></p> : null}
          <p className="section-kicker">Talk with the owner</p>
          <h2>Location and contact</h2>
          <p className="contact-address">{listing.barangay ? `${listing.barangay} · ` : ""}{listing.address_line}</p>
          <p><a className="map-link" href={mapUrl} target="_blank" rel="noreferrer">View exact pin on OpenStreetMap<span className="visually-hidden"> (opens in a new tab)</span></a></p>
          <hr />
          <p><strong>{listing.contact_name}</strong></p>
          {listing.contact_phone ? <p><a href={`tel:${listing.contact_phone}`}>{listing.contact_phone}</a></p> : null}
          {listing.contact_email ? <p><a href={`mailto:${listing.contact_email}`}>{listing.contact_email}</a></p> : null}
          <p className="field-help">Contact the owner directly. RoomScouter does not process reservations or payments.</p>
          {profile?.role === "student" ? <ReportForm id={`listing-${id}`} label="Report this listing" action={reportListingAction} /> : null}
        </aside>
      </div>

      <ReviewSection
        reviews={publicReviews}
        ownReview={ownReview}
        isStudent={profile?.role === "student"}
        reviewCount={reviewCount}
        averageRating={averageRating}
        page={reviewPage}
        hasPrevious={reviewPage > 1}
        hasNext={reviewPage * REVIEW_PAGE_SIZE < reviewCount}
        listingId={id}
        saveAction={saveReviewAction}
        deleteAction={deleteReviewAction}
        reportAction={reportReviewAction}
      />
    </main>
  );
}
