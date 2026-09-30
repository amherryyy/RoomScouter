"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isUuid } from "../listings/model";
import { requireAdmin } from "./access";

type ReviewDecision = "hidden" | "published";

function actionError(message: string): never {
  redirect(`/admin/reviews?error=${encodeURIComponent(message)}`);
}

export async function moderateReview(
  reviewId: string,
  listingId: string,
  decision: ReviewDecision,
  formData: FormData,
): Promise<never> {
  if (!isUuid(reviewId) || !isUuid(listingId)) actionError("The review could not be found.");
  if (!["hidden", "published"].includes(decision)) actionError("The moderation decision is invalid.");
  const rawReason = formData.get("reason");
  const reason = typeof rawReason === "string" ? rawReason.trim() : "";
  if (reason.length < 3 || reason.length > 1000) {
    actionError("Provide a reason using 3 to 1,000 characters.");
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("moderate_review", {
    target_id: reviewId,
    decision,
    reason,
  });
  if (error) actionError("This review can no longer receive that decision.");

  revalidatePath("/admin/reviews");
  revalidatePath(`/listings/${listingId}`);
  redirect(`/admin/reviews?state=${decision === "hidden" ? "hidden" : "published"}&message=${encodeURIComponent(`Review ${decision === "hidden" ? "hidden" : "restored"}.`)}`);
}
