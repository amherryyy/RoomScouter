"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isUuid } from "../listings/model";
import { requireAdmin } from "./access";

type ModerationDecision = "approved" | "rejected" | "archived";

function detailPath(listingId: string): string {
  return isUuid(listingId) ? `/admin/listings/${listingId}` : "/admin";
}

function actionError(listingId: string, message: string): never {
  redirect(`${detailPath(listingId)}?error=${encodeURIComponent(message)}`);
}

function parseReason(decision: ModerationDecision, formData: FormData): string | null {
  const value = formData.get("reason");
  const reason = typeof value === "string" ? value.trim() : "";
  if (decision === "approved") return null;
  return reason.length >= 5 && reason.length <= 1000 ? reason : null;
}

export async function moderateListing(
  listingId: string,
  decision: ModerationDecision,
  formData: FormData,
): Promise<never> {
  if (!isUuid(listingId)) actionError(listingId, "The listing could not be found.");
  if (!["approved", "rejected", "archived"].includes(decision)) {
    actionError(listingId, "The moderation decision is invalid.");
  }

  const reason = parseReason(decision, formData);
  if (decision !== "approved" && !reason) {
    actionError(listingId, "Provide a reason using 5 to 1,000 characters.");
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("moderate_boarding_house", {
    target_id: listingId,
    decision,
    reason: reason ?? undefined,
  });
  if (error) actionError(listingId, "This listing can no longer receive that decision.");

  revalidatePath("/admin");
  revalidatePath(detailPath(listingId));
  revalidatePath("/");
  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/owner");
  redirect(`${detailPath(listingId)}?message=${encodeURIComponent(`Listing ${decision}.`)}`);
}
