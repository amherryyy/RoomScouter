import Link from "next/link";
import { notFound } from "next/navigation";
import { submitListing, updateListing } from "../../../../../src/features/listings/actions";
import { requireOwner } from "../../../../../src/features/listings/access";
import { ListingForm } from "../../../../../src/features/listings/listing-form";
import { isUuid } from "../../../../../src/features/listings/model";

type EditListingPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function EditListingPage({ params, searchParams }: EditListingPageProps) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const { supabase, user } = await requireOwner();
  const { data: listing } = await supabase
    .from("boarding_houses")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!listing) notFound();

  const { error, message } = await searchParams;
  const updateAction = updateListing.bind(null, listing.id);
  const submitAction = submitListing.bind(null, listing.id);
  const canSubmit = listing.status === "draft" || listing.status === "rejected";

  return (
    <main className="workspace-shell narrow-workspace">
      <div className="listing-card-heading">
        <div>
          <p className="eyebrow">Owner workspace</p>
          <h1>Edit listing</h1>
        </div>
        <span className={`status status-${listing.status}`}>{listing.status}</span>
      </div>

      {error ? <p className="notice error" role="alert">{error}</p> : null}
      {message ? <p className="notice success" role="status">{message}</p> : null}
      {listing.moderation_note ? (
        <section className="moderation-note" aria-labelledby="moderation-note-title">
          <h2 id="moderation-note-title">Moderator feedback</h2>
          <p>{listing.moderation_note}</p>
        </section>
      ) : null}
      {listing.status === "approved" ? (
        <p className="notice">Changing listing details will return this listing to pending review. Updating availability alone preserves approval.</p>
      ) : null}

      <ListingForm action={updateAction} listing={listing} submitLabel="Save listing" />

      {canSubmit ? (
        <section className="submission-panel">
          <div>
            <h2>Ready for review?</h2>
            <p>Check every fact before sending this listing to an administrator.</p>
          </div>
          <form action={submitAction}><button type="submit">Submit for review</button></form>
        </section>
      ) : null}

      <p><Link href="/owner">Back to your listings</Link></p>
    </main>
  );
}
