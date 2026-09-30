import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect(`/account?error=${encodeURIComponent("Administrator access is required.")}`);
  }

  return { supabase, user };
}
