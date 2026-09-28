"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isUuid } from "../listings/model";
import { requireStudent } from "../students/access";

function reviewPath(listingId: string): string {
  return isUuid(listingId) ? `/listings/${listingId}` : "/";
}

function reviewError(listingId: string, message: string): never {
  redirect(`${reviewPath(listingId)}?error=${encodeURIComponent(message)}#reviews`);
}

function parseReview(formData: FormData): { rating: number; comment: string } | null {
  const rating = Number(formData.get("rating"));
  const rawComment = formData.get("comment");
  const comment = typeof rawComment === "string" ? rawComment.trim() : "";
  return Number.isInteger(rating) && rating >= 1 && rating <= 5 && comment.length >= 3 && comment.length <= 2000
    ? { rating, comment }
    : null;
}

export async function saveReview(listingId: string, formData: FormData): Promise<never> {
  if (!isUuid(listingId)) reviewError(listingId, "The listing could not be found.");
  const parsed = parseReview(formData);
  if (!parsed) reviewError(listingId, "Choose a rating and write between 3 and 2,000 characters.");

  const { supabase, user } = await requireStudent();
  const { data: currentReviews, error: currentError } = await supabase.rpc("get_current_student_review", {
    target_id: listingId,
  });
  if (currentError) reviewError(listingId, "Your review could not be loaded.");
  const currentReview = currentReviews[0];
  const result = currentReview
    ? await supabase.from("reviews").update(parsed).eq("id", currentReview.id)
    : await supabase.from("reviews").insert({
      student_id: user.id,
      boarding_house_id: listingId,
      ...parsed,
    });
  if (result.error) reviewError(listingId, "The review could not be saved.");

  revalidatePath(reviewPath(listingId));
  redirect(`${reviewPath(listingId)}?message=${encodeURIComponent("Review saved.")}#reviews`);
}

export async function deleteReview(listingId: string): Promise<never> {
  if (!isUuid(listingId)) reviewError(listingId, "The listing could not be found.");
  const { supabase, user } = await requireStudent();
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("student_id", user.id)
    .eq("boarding_house_id", listingId);
  if (error) reviewError(listingId, "The review could not be removed.");

  revalidatePath(reviewPath(listingId));
  redirect(`${reviewPath(listingId)}?message=${encodeURIComponent("Review removed.")}#reviews`);
}
