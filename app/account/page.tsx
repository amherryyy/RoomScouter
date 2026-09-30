import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SubmitButton } from "../../src/components/submit-button";
import { logout } from "../../src/features/auth/actions";
import { createServerSupabaseClient } from "../../src/lib/supabase/server";

type AccountPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export const metadata: Metadata = {
  title: "Your account | RoomScouter",
};

const roleLabels = {
  student: "Student",
  owner: "Property owner",
  admin: "Administrator",
} as const;

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
  const role = profile?.role;
  const displayName = profile?.display_name ?? "RoomScouter account";
  const accountInitial = displayName.trim().charAt(0).toUpperCase() || "R";

  return (
    <main className="workspace-shell account-hub" id="main-content" tabIndex={-1}>
      <header className="account-header">
        <Link className="wordmark" href="/">RoomScouter</Link>
        <Link href="/#browse">Browse listings</Link>
      </header>
      {error ? <p className="notice error" role="alert">{error}</p> : null}

      <section className="account-summary" aria-labelledby="account-name">
        <div className="account-avatar" aria-hidden="true">{accountInitial}</div>
        <div className="account-identity">
          <p className="eyebrow">Your account</p>
          <h1 id="account-name">{displayName}</h1>
          <p className="role-label">{role ? roleLabels[role] : "Profile setup pending"}</p>
        </div>
        <dl className="account-details">
          <div><dt>Email</dt><dd>{user.email}</dd></div>
          <div><dt>Account type</dt><dd>{role ? roleLabels[role] : "Pending"}</dd></div>
        </dl>
      </section>

      <section className="account-section" aria-labelledby="account-actions-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Workspace</p>
            <h2 id="account-actions-heading">What would you like to do?</h2>
          </div>
        </div>
        <div className="account-action-grid">
          {role === "student" ? (
            <>
              <Link className="account-action-card" href="/favorites">
                <span className="action-kicker">Saved</span>
                <strong>View favorite listings</strong>
                <span>Return to the approved rooms you are comparing.</span>
              </Link>
              <Link className="account-action-card" href="/reports">
                <span className="action-kicker">Safety</span>
                <strong>Track your reports</strong>
                <span>Review the private concerns you submitted and their outcomes.</span>
              </Link>
            </>
          ) : null}
          {role === "owner" ? (
            <>
              <Link className="account-action-card" href="/owner">
                <span className="action-kicker">Properties</span>
                <strong>Open owner dashboard</strong>
                <span>Manage listings, publication status, and moderation feedback.</span>
              </Link>
              <Link className="account-action-card" href="/owner/listings/new">
                <span className="action-kicker">New listing</span>
                <strong>Add a property</strong>
                <span>Start a private draft before submitting it for review.</span>
              </Link>
            </>
          ) : null}
          {role === "admin" ? (
            <>
              <Link className="account-action-card" href="/admin">
                <span className="action-kicker">Listings</span>
                <strong>Open moderation dashboard</strong>
                <span>Review pending properties and manage published listings.</span>
              </Link>
              <Link className="account-action-card" href="/admin/reviews">
                <span className="action-kicker">Reviews</span>
                <strong>Moderate community reviews</strong>
                <span>Inspect published and hidden reviews with an audit trail.</span>
              </Link>
              <Link className="account-action-card" href="/admin/reports">
                <span className="action-kicker">Reports</span>
                <strong>Handle submitted reports</strong>
                <span>Resolve or dismiss open student concerns.</span>
              </Link>
            </>
          ) : null}
          <Link className="account-action-card" href="/#browse">
            <span className="action-kicker">Discover</span>
            <strong>Browse approved listings</strong>
            <span>Search available rooms and compare their details.</span>
          </Link>
        </div>
      </section>

      <section className="account-future" aria-labelledby="profile-editing-heading">
        <div>
          <p className="preview-badge">Under construction</p>
          <h2 id="profile-editing-heading">Profile editing</h2>
          <p>A future RoomScouter update may include editable profile details. For now, identity and role changes remain protected.</p>
        </div>
        <form action={logout}>
          <SubmitButton pendingLabel="Logging out…" className="secondary">Log out</SubmitButton>
        </form>
      </section>
    </main>
  );
}
