"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isUuid } from "../listings/model";
import { requireStudent } from "../students/access";

function listingPath(listingId: string): string {
  return isUuid(listingId) ? `/listings/${listingId}` : "/";
}

function favoriteError(listingId: string, message: string): never {
  redirect(`${listingPath(listingId)}?error=${encodeURIComponent(message)}`);
}

export async function addFavorite(listingId: string): Promise<never> {
  if (!isUuid(listingId)) favoriteError(listingId, "The listing could not be found.");
  const { supabase, user } = await requireStudent();
  const { error } = await supabase.from("favorites").insert({
    student_id: user.id,
    boarding_house_id: listingId,
  });
  if (error && error.code !== "23505") {
    favoriteError(listingId, "Only approved, available listings can be saved.");
  }

  revalidatePath("/");
  revalidatePath("/favorites");
  revalidatePath(listingPath(listingId));
  redirect(`${listingPath(listingId)}?message=${encodeURIComponent("Listing saved.")}`);
}

export async function removeFavorite(listingId: string): Promise<never> {
  if (!isUuid(listingId)) favoriteError(listingId, "The listing could not be found.");
  const { supabase, user } = await requireStudent();
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("student_id", user.id)
    .eq("boarding_house_id", listingId);
  if (error) favoriteError(listingId, "The saved listing could not be removed.");

  revalidatePath("/");
  revalidatePath("/favorites");
  revalidatePath(listingPath(listingId));
  redirect(`${listingPath(listingId)}?message=${encodeURIComponent("Listing removed from saved listings.")}`);
}
