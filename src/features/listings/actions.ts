"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "./access";
import { isUuid, parseListingInput } from "./model";
import type { ListingAvailabilityState, ListingFormState } from "./listing-form-state";

function actionError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createListing(_previousState: ListingFormState, formData: FormData): Promise<ListingFormState> {
  const parsed = parseListingInput(formData);
  if (!parsed.ok) return { status: "error", message: parsed.message };

  const { supabase, user } = await requireOwner();
  const { data, error } = await supabase
    .from("boarding_houses")
    .insert({ owner_id: user.id, ...parsed.value })
    .select("id")
    .single();

  if (error || !data) return { status: "error", message: "The draft could not be created." };

  revalidatePath("/owner");
  redirect(`/owner/listings/${data.id}/edit?message=${encodeURIComponent("Draft created.")}`);
}

export async function updateListing(
  listingId: string,
  _previousState: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  if (!isUuid(listingId)) actionError("/owner", "The listing could not be found.");
  const path = `/owner/listings/${listingId}/edit`;
  const parsed = parseListingInput(formData);
  if (!parsed.ok) return { status: "error", message: parsed.message };

  const { supabase, user } = await requireOwner();
  const { data, error } = await supabase
    .from("boarding_houses")
    .update(parsed.value)
    .eq("id", listingId)
    .eq("owner_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) return { status: "error", message: "The listing could not be updated." };

  revalidatePath("/owner");
  revalidatePath(path);
  return { status: "success", message: "Listing saved." };
}

export async function updateListingAvailability(
  listingId: string,
  _previousState: ListingAvailabilityState,
  formData: FormData,
): Promise<ListingAvailabilityState> {
  if (!isUuid(listingId)) {
    return { status: "error", message: "The listing could not be found.", availableRooms: 0 };
  }
  const currentValue = formData.get("currentRooms");
  const intent = formData.get("intent");
  const currentRooms = typeof currentValue === "string" ? Number(currentValue) : Number.NaN;
  if (!Number.isInteger(currentRooms) || currentRooms < 0 || currentRooms > 1000) {
    return { status: "error", message: "Refresh the page and try again.", availableRooms: 0 };
  }
  let availableRooms = currentRooms;
  if (intent === "increase") availableRooms = Math.min(currentRooms + 1, 1000);
  else if (intent === "decrease") availableRooms = Math.max(currentRooms - 1, 0);
  else if (intent === "full") availableRooms = 0;
  else return { status: "error", message: "Choose an availability update.", availableRooms: currentRooms };
  if (availableRooms === currentRooms) {
    return { status: "success", message: "Availability is already at that number.", availableRooms };
  }

  const { supabase, user } = await requireOwner();
  const { data, error } = await supabase
    .from("boarding_houses")
    .update({ available_rooms: availableRooms })
    .eq("id", listingId)
    .eq("owner_id", user.id)
    .eq("available_rooms", currentRooms)
    .select("id")
    .maybeSingle();
  if (error) {
    return { status: "error", message: "Availability could not be saved. Please try again.", availableRooms: currentRooms };
  }
  if (!data) {
    return { status: "error", message: "Availability changed elsewhere. Refresh and try again.", availableRooms: currentRooms };
  }
  revalidatePath("/owner");
  revalidatePath("/");
  revalidatePath("/map");
  revalidatePath("/favorites");
  revalidatePath("/listings/" + listingId);
  return { status: "success", message: "Availability updated.", availableRooms };
}
export async function submitListing(listingId: string, _previousState: ListingFormState, _formData: FormData): Promise<ListingFormState> {
  if (!isUuid(listingId)) actionError("/owner", "The listing could not be found.");
  const path = `/owner/listings/${listingId}/edit`;
  const { supabase } = await requireOwner();
  const { error } = await supabase.rpc("submit_boarding_house", { target_id: listingId });

  if (error) return { status: "error", message: "Only a complete draft or rejected listing can be submitted." };

  revalidatePath("/owner");
  revalidatePath(path);
  return { status: "success", message: "Listing submitted for review." };
}

function parseCatalogIds(values: FormDataEntryValue[]): number[] | null {
  const ids = values.map((value) => typeof value === "string" ? Number(value) : Number.NaN);
  return ids.every((id) => Number.isInteger(id) && id > 0) && new Set(ids).size === ids.length
    ? ids
    : null;
}

function attributePath(listingId: string): string {
  if (!isUuid(listingId)) actionError("/owner", "The listing could not be found.");
  return `/owner/listings/${listingId}/edit`;
}

export async function saveFacilities(listingId: string, _previousState: ListingFormState, formData: FormData): Promise<ListingFormState> {
  const path = attributePath(listingId);
  const facilityIds = parseCatalogIds(formData.getAll("facilityIds"));
  if (!facilityIds) return { status: "error", message: "The facility selection is invalid." };

  const { supabase } = await requireOwner();
  const { error } = await supabase.rpc("replace_boarding_house_facilities", {
    target_id: listingId,
    target_facility_ids: facilityIds,
  });
  if (error) return { status: "error", message: "Facilities could not be saved." };

  revalidatePath("/owner");
  revalidatePath(path);
  return { status: "success", message: "Facilities saved." };
}

export async function saveUtilities(listingId: string, _previousState: ListingFormState, formData: FormData): Promise<ListingFormState> {
  const path = attributePath(listingId);
  const utilityIds = parseCatalogIds(formData.getAll("utilityIds"));
  if (!utilityIds) return { status: "error", message: "The utility selection is invalid." };

  const includedValues: boolean[] = [];
  const detailValues: string[] = [];
  for (const utilityId of utilityIds) {
    includedValues.push(formData.get(`utilityIncluded:${utilityId}`) === "on");
    const rawDetails = formData.get(`utilityDetails:${utilityId}`);
    if (typeof rawDetails !== "string" || rawDetails.trim().length > 240) {
      return { status: "error", message: "Utility details must contain at most 240 characters." };
    }
    detailValues.push(rawDetails.trim());
  }

  const { supabase } = await requireOwner();
  const { error } = await supabase.rpc("replace_boarding_house_utilities", {
    target_id: listingId,
    target_utility_ids: utilityIds,
    target_included_values: includedValues,
    target_detail_values: detailValues,
  });
  if (error) return { status: "error", message: "Utilities could not be saved." };

  revalidatePath("/owner");
  revalidatePath(path);
  return { status: "success", message: "Utilities saved." };
}

export async function saveHouseRules(listingId: string, _previousState: ListingFormState, formData: FormData): Promise<ListingFormState> {
  const path = attributePath(listingId);
  const rawRules = formData.getAll("rules");
  if (rawRules.length > 10 || rawRules.some((rule) => typeof rule !== "string")) {
    return { status: "error", message: "House rules are invalid." };
  }
  const rules = (rawRules as string[]).map((rule) => rule.trim()).filter(Boolean);
  if (rules.some((rule) => rule.length < 3 || rule.length > 500)) {
    return { status: "error", message: "Each house rule must contain between 3 and 500 characters." };
  }

  const { supabase } = await requireOwner();
  const { error } = await supabase.rpc("replace_house_rules", {
    target_id: listingId,
    target_rules: rules,
  });
  if (error) return { status: "error", message: "House rules could not be saved." };

  revalidatePath("/owner");
  revalidatePath(path);
  return { status: "success", message: "House rules saved." };
}

const PHOTO_BUCKET = "listing-photos";
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const PHOTO_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
};

function parsePhotoAltText(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const altText = value.trim();
  return altText.length >= 3 && altText.length <= 200 ? altText : null;
}

export async function uploadListingPhoto(listingId: string, _previousState: ListingFormState, formData: FormData): Promise<ListingFormState> {
  const path = attributePath(listingId);
  const file = formData.get("photo");
  const altText = parsePhotoAltText(formData.get("altText"));
  if (!(file instanceof File) || file.size === 0) return { status: "error", message: "Choose a photo to upload." };
  const extension = PHOTO_EXTENSIONS[file.type];
  if (!extension || file.size > MAX_PHOTO_BYTES) {
    return { status: "error", message: "Photos must be JPEG or PNG files no larger than 10 MiB." };
  }
  if (!altText) return { status: "error", message: "Describe the photo using 3 to 200 characters." };

  const { supabase, user } = await requireOwner();
  const { data: listing } = await supabase
    .from("boarding_houses")
    .select("id")
    .eq("id", listingId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!listing) actionError("/owner", "The listing could not be found.");

  const { data: photos, error: photoReadError } = await supabase
    .from("listing_photos")
    .select("position")
    .eq("boarding_house_id", listingId);
  if (photoReadError) return { status: "error", message: "Photos could not be loaded." };
  if (photos.length >= 10) return { status: "error", message: "A listing can contain at most 10 photos." };
  const occupiedPositions = new Set(photos.map((photo) => photo.position));
  const nextPosition = Array.from({ length: 10 }, (_, index) => index + 1)
    .find((position) => !occupiedPositions.has(position));
  if (!nextPosition) return { status: "error", message: "A listing can contain at most 10 photos." };

  const objectPath = `${user.id}/${listingId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(objectPath, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    console.error("Listing photo upload was rejected by Supabase Storage.", {
      listingId,
      ownerId: user.id,
      objectPath,
      mediaType: file.type,
      byteSize: file.size,
      error: uploadError.message,
    });
    return { status: "error", message: "Storage rejected the photo. Refresh the page, sign in again, and retry." };
  }

  const { error: metadataError } = await supabase.from("listing_photos").insert({
    boarding_house_id: listingId,
    object_path: objectPath,
    media_type: file.type,
    byte_size: file.size,
    alt_text: altText,
    position: nextPosition,
    created_by: user.id,
  });
  if (metadataError) {
    await supabase.storage.from(PHOTO_BUCKET).remove([objectPath]);
    return { status: "error", message: "The photo could not be added to the listing." };
  }

  revalidatePath("/owner");
  revalidatePath(path);
  return { status: "success", message: "Photo uploaded." };
}

export async function savePhotoDetails(listingId: string, _previousState: ListingFormState, formData: FormData): Promise<ListingFormState> {
  const path = attributePath(listingId);
  const photoIds = formData.getAll("photoIds");
  if (photoIds.length > 10 || photoIds.some((id) => typeof id !== "string" || !isUuid(id))) {
    return { status: "error", message: "The photo selection is invalid." };
  }

  const details = (photoIds as string[]).map((id) => ({
    id,
    altText: parsePhotoAltText(formData.get(`photoAltText:${id}`)),
    position: Number(formData.get(`photoPosition:${id}`)),
  }));
  const positions = details.map((photo) => photo.position);
  if (
    details.some((photo) => !photo.altText || !Number.isInteger(photo.position))
    || new Set(positions).size !== details.length
    || positions.some((position) => position < 1 || position > details.length)
  ) {
    return { status: "error", message: "Each photo needs unique ordering and alternative text." };
  }
  details.sort((left, right) => left.position - right.position);

  const { supabase } = await requireOwner();
  const { error } = await supabase.rpc("replace_listing_photo_details", {
    target_id: listingId,
    target_photo_ids: details.map((photo) => photo.id),
    target_alt_texts: details.map((photo) => photo.altText as string),
  });
  if (error) return { status: "error", message: "Photo details could not be saved." };

  revalidatePath("/owner");
  revalidatePath(path);
  return { status: "success", message: "Photo details saved." };
}

export async function deleteListingPhoto(
  listingId: string,
  _previousState: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const path = attributePath(listingId);
  const photoId = formData.get("photoId");
  if (typeof photoId !== "string" || !isUuid(photoId)) return { status: "error", message: "The photo could not be found." };

  const { supabase } = await requireOwner();
  const { data: photo, error: readError } = await supabase
    .from("listing_photos")
    .select("id, object_path")
    .eq("id", photoId)
    .eq("boarding_house_id", listingId)
    .maybeSingle();
  if (readError || !photo) return { status: "error", message: "The photo could not be found." };

  const { error: deleteError } = await supabase
    .from("listing_photos")
    .delete()
    .eq("id", photo.id)
    .eq("boarding_house_id", listingId);
  if (deleteError) return { status: "error", message: "The photo could not be removed." };

  const { error: storageError } = await supabase.storage.from(PHOTO_BUCKET).remove([photo.object_path]);
  revalidatePath("/owner");
  revalidatePath(path);
  if (storageError) {
    return { status: "error", message: "The photo was hidden, but private file cleanup is pending." };
  }
  return { status: "success", message: "Photo removed." };
}
