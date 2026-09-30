"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isUuid } from "../listings/model";
import { requireStudent } from "../students/access";

function listingPath(listingId: string): string {
  return isUuid(listingId) ? `/listings/${listingId}` : "/";
}

function reportError(listingId: string, message: string): never {
  redirect(`${listingPath(listingId)}?error=${encodeURIComponent(message)}#reports`);
}

function parseReason(formData: FormData): string | null {
  const value = formData.get("reason");
  if (typeof value !== "string") return null;
  const reason = value.trim();
  return reason.length >= 10 && reason.length <= 1000 ? reason : null;
}

async function submitReport(
  listingId: string,
  target: { target_type: "listing"; boarding_house_id: string } | { target_type: "review"; review_id: string },
  formData: FormData,
): Promise<never> {
  if (!isUuid(listingId)) reportError(listingId, "The listing could not be found.");
  const reason = parseReason(formData);
  if (!reason) reportError(listingId, "Describe the concern using 10 to 1,000 characters.");

  const { supabase, user } = await requireStudent();
  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reason,
    ...target,
  });
  if (error?.code === "23505") reportError(listingId, "You already have an open report for this item.");
  if (error) reportError(listingId, "The report could not be submitted.");

  revalidatePath("/reports");
  revalidatePath(listingPath(listingId));
  redirect(`${listingPath(listingId)}?message=${encodeURIComponent("Report submitted privately.")}#reports`);
}

export async function reportListing(listingId: string, formData: FormData): Promise<never> {
  return submitReport(listingId, { target_type: "listing", boarding_house_id: listingId }, formData);
}

export async function reportReview(
  listingId: string,
  reviewId: string,
  formData: FormData,
): Promise<never> {
  if (!isUuid(reviewId)) reportError(listingId, "The review could not be found.");
  return submitReport(listingId, { target_type: "review", review_id: reviewId }, formData);
}
