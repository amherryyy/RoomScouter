"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "./access";
import { isUuid, parseListingInput } from "./model";

function actionError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createListing(formData: FormData): Promise<never> {
  const parsed = parseListingInput(formData);
  if (!parsed.ok) actionError("/owner/listings/new", parsed.message);

  const { supabase, user } = await requireOwner();
  const { data, error } = await supabase
    .from("boarding_houses")
    .insert({ owner_id: user.id, ...parsed.value })
    .select("id")
    .single();

  if (error || !data) actionError("/owner/listings/new", "The draft could not be created.");

  revalidatePath("/owner");
  redirect(`/owner/listings/${data.id}/edit?message=${encodeURIComponent("Draft created.")}`);
}

export async function updateListing(listingId: string, formData: FormData): Promise<never> {
  if (!isUuid(listingId)) actionError("/owner", "The listing could not be found.");
  const path = `/owner/listings/${listingId}/edit`;
  const parsed = parseListingInput(formData);
  if (!parsed.ok) actionError(path, parsed.message);

  const { supabase, user } = await requireOwner();
  const { data, error } = await supabase
    .from("boarding_houses")
    .update(parsed.value)
    .eq("id", listingId)
    .eq("owner_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) actionError(path, "The listing could not be updated.");

  revalidatePath("/owner");
  revalidatePath(path);
  redirect(`${path}?message=${encodeURIComponent("Listing saved.")}`);
}

export async function submitListing(listingId: string): Promise<never> {
  if (!isUuid(listingId)) actionError("/owner", "The listing could not be found.");
  const path = `/owner/listings/${listingId}/edit`;
  const { supabase } = await requireOwner();
  const { error } = await supabase.rpc("submit_boarding_house", { target_id: listingId });

  if (error) actionError(path, "Only a complete draft or rejected listing can be submitted.");

  revalidatePath("/owner");
  revalidatePath(path);
  redirect(`${path}?message=${encodeURIComponent("Listing submitted for review.")}`);
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

export async function saveFacilities(listingId: string, formData: FormData): Promise<never> {
  const path = attributePath(listingId);
  const facilityIds = parseCatalogIds(formData.getAll("facilityIds"));
  if (!facilityIds) actionError(path, "The facility selection is invalid.");

  const { supabase } = await requireOwner();
  const { error } = await supabase.rpc("replace_boarding_house_facilities", {
    target_id: listingId,
    target_facility_ids: facilityIds,
  });
  if (error) actionError(path, "Facilities could not be saved.");

  revalidatePath("/owner");
  revalidatePath(path);
  redirect(`${path}?message=${encodeURIComponent("Facilities saved.")}`);
}

export async function saveUtilities(listingId: string, formData: FormData): Promise<never> {
  const path = attributePath(listingId);
  const utilityIds = parseCatalogIds(formData.getAll("utilityIds"));
  if (!utilityIds) actionError(path, "The utility selection is invalid.");

  const includedValues: boolean[] = [];
  const detailValues: string[] = [];
  for (const utilityId of utilityIds) {
    includedValues.push(formData.get(`utilityIncluded:${utilityId}`) === "on");
    const rawDetails = formData.get(`utilityDetails:${utilityId}`);
    if (typeof rawDetails !== "string" || rawDetails.trim().length > 240) {
      actionError(path, "Utility details must contain at most 240 characters.");
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
  if (error) actionError(path, "Utilities could not be saved.");

  revalidatePath("/owner");
  revalidatePath(path);
  redirect(`${path}?message=${encodeURIComponent("Utilities saved.")}`);
}

export async function saveHouseRules(listingId: string, formData: FormData): Promise<never> {
  const path = attributePath(listingId);
  const rawRules = formData.getAll("rules");
  if (rawRules.length > 10 || rawRules.some((rule) => typeof rule !== "string")) {
    actionError(path, "House rules are invalid.");
  }
  const rules = (rawRules as string[]).map((rule) => rule.trim()).filter(Boolean);
  if (rules.some((rule) => rule.length < 3 || rule.length > 500)) {
    actionError(path, "Each house rule must contain between 3 and 500 characters.");
  }

  const { supabase } = await requireOwner();
  const { error } = await supabase.rpc("replace_house_rules", {
    target_id: listingId,
    target_rules: rules,
  });
  if (error) actionError(path, "House rules could not be saved.");

  revalidatePath("/owner");
  revalidatePath(path);
  redirect(`${path}?message=${encodeURIComponent("House rules saved.")}`);
}
