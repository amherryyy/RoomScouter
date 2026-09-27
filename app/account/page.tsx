import { redirect } from "next/navigation";
import { logout } from "../../src/features/auth/actions";
import { createServerSupabaseClient } from "../../src/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main>
      <p className="eyebrow">Your account</p>
      <h1>{profile?.display_name ?? "Account"}</h1>
      <dl className="account-details">
        <div><dt>Email</dt><dd>{user.email}</dd></div>
        <div><dt>Role</dt><dd>{profile?.role ?? "Profile setup pending"}</dd></div>
      </dl>
      <form action={logout}><button type="submit" className="secondary">Log out</button></form>
    </main>
  );
}
