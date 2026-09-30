import Link from "next/link";
import { notFound } from "next/navigation";
import { SubmitButton } from "../../../../../src/components/submit-button";
import {
  deleteListingPhoto,
  saveFacilities,
  saveHouseRules,
  savePhotoDetails,
  saveUtilities,
  submitListing,
  updateListing,
  uploadListingPhoto,
} from "../../../../../src/features/listings/actions";
import { requireOwner } from "../../../../../src/features/listings/access";
import { AttributeForms } from "../../../../../src/features/listings/attribute-forms";
import { ListingForm } from "../../../../../src/features/listings/listing-form";
import { isUuid } from "../../../../../src/features/listings/model";
import { PhotoEditor } from "../../../../../src/features/listings/photo-editor";

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

  const [
    { data: facilities },
    { data: utilities },
    { data: selectedFacilities },
    { data: selectedUtilities },
    { data: rules },
    { data: photos },
  ] = await Promise.all([
    supabase.from("facilities").select("id, name").order("name"),
    supabase.from("utilities").select("id, name").order("name"),
    supabase.from("boarding_house_facilities").select("facility_id").eq("boarding_house_id", id),
    supabase
      .from("boarding_house_utilities")
      .select("utility_id, is_included, details")
      .eq("boarding_house_id", id),
    supabase.from("house_rules").select("id, rule_text, position").eq("boarding_house_id", id).order("position"),
    supabase
      .from("listing_photos")
      .select("id, object_path, media_type, byte_size, alt_text, position")
      .eq("boarding_house_id", id)
      .order("position"),
  ]);

  const photosWithUrls = await Promise.all((photos ?? []).map(async (photo) => {
    const { data } = await supabase.storage.from("listing-photos").createSignedUrl(photo.object_path, 60 * 60);
    return { ...photo, signedUrl: data?.signedUrl ?? null };
  }));

  const { error, message } = await searchParams;
  const updateAction = updateListing.bind(null, listing.id);
  const submitAction = submitListing.bind(null, listing.id);
  const facilityAction = saveFacilities.bind(null, listing.id);
  const utilityAction = saveUtilities.bind(null, listing.id);
  const ruleAction = saveHouseRules.bind(null, listing.id);
  const uploadPhotoAction = uploadListingPhoto.bind(null, listing.id);
  const savePhotoAction = savePhotoDetails.bind(null, listing.id);
  const deletePhotoAction = deleteListingPhoto.bind(null, listing.id);
  const canSubmit = listing.status === "draft" || listing.status === "rejected";

  return (
    <main className="workspace-shell narrow-workspace" id="main-content" tabIndex={-1}>
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

      <AttributeForms
        facilities={facilities ?? []}
        selectedFacilityIds={(selectedFacilities ?? []).map((item) => item.facility_id)}
        utilities={utilities ?? []}
        selectedUtilities={selectedUtilities ?? []}
        rules={rules ?? []}
        facilityAction={facilityAction}
        utilityAction={utilityAction}
        ruleAction={ruleAction}
      />

      <PhotoEditor
        photos={photosWithUrls}
        uploadAction={uploadPhotoAction}
        saveAction={savePhotoAction}
        deleteAction={deletePhotoAction}
      />

      {canSubmit ? (
        <section className="submission-panel">
          <div>
            <h2>Ready for review?</h2>
            <p>Check every fact before sending this listing to an administrator.</p>
          </div>
          <form action={submitAction}><SubmitButton pendingLabel="Submitting for review…">Submit for review</SubmitButton></form>
        </section>
      ) : null}

      <p><Link href="/owner">Back to your listings</Link></p>
    </main>
  );
}
