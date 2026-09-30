import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "../../src/features/auth/actions";
import { createServerSupabaseClient } from "../../src/lib/supabase/server";

type AccountPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const { error } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main id="main-content" tabIndex={-1}>
      <p className="eyebrow">Your account</p>
      <h1>{profile?.display_name ?? "Account"}</h1>
      {error ? <p className="notice error" role="alert">{error}</p> : null}
      <dl className="account-details">
        <div><dt>Email</dt><dd>{user.email}</dd></div>
        <div><dt>Role</dt><dd>{profile?.role ?? "Profile setup pending"}</dd></div>
      </dl>
      {profile?.role === "owner" ? <p><Link className="button" href="/owner">Open owner dashboard</Link></p> : null}
      {profile?.role === "admin" ? <p><Link className="button" href="/admin">Open moderation dashboard</Link></p> : null}
      {profile?.role === "student" ? <p><Link className="button" href="/favorites">View saved listings</Link></p> : null}
      {profile?.role === "student" ? <p><Link href="/reports">View your reports</Link></p> : null}
      <form action={logout}><button type="submit" className="secondary">Log out</button></form>
    </main>
  );
}
