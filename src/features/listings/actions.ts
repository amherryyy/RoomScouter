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
