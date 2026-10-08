"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import type { ProfileFormState } from "./profile-form-state";
import { parseProfileDisplayName } from "./model";

export async function updateOwnDisplayName(
  _previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const displayName = parseProfileDisplayName(formData.get("displayName"));
  if (!displayName) return { status: "error", message: "Enter a name between 1 and 80 characters." };
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Your session has expired. Sign in again to update your profile." };
  const { data, error } = await supabase.from("profiles")
    .update({ display_name: displayName }).eq("id", user.id).select("id").maybeSingle();
  if (error || !data) return { status: "error", message: "Your display name could not be saved. Please try again." };
  revalidatePath("/", "layout");
  revalidatePath("/account");
  return { status: "success", message: "Your display name has been saved." };
}
