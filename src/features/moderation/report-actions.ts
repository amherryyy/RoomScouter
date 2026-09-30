"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isUuid } from "../listings/model";
import { requireAdmin } from "./access";

type ReportDecision = "resolved" | "dismissed";

function actionError(message: string): never {
  redirect(`/admin/reports?error=${encodeURIComponent(message)}`);
}

export async function resolveReport(
  reportId: string,
  decision: ReportDecision,
  formData: FormData,
): Promise<never> {
  if (!isUuid(reportId)) actionError("The report could not be found.");
  if (!["resolved", "dismissed"].includes(decision)) actionError("The report outcome is invalid.");
  const rawNote = formData.get("note");
  const note = typeof rawNote === "string" ? rawNote.trim() : "";
  if (note.length < 3 || note.length > 1000) {
    actionError("Provide an outcome note using 3 to 1,000 characters.");
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("resolve_report", {
    target_id: reportId,
    decision,
    note,
  });
  if (error) actionError("This report can no longer receive an outcome.");

  revalidatePath("/admin/reports");
  revalidatePath("/reports");
  redirect(`/admin/reports?state=${decision}&message=${encodeURIComponent(`Report ${decision}.`)}`);
}
