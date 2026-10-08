import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { SubmitButton } from "./submit-button";
import { logout } from "../features/auth/actions";
import { createServerSupabaseClient } from "../lib/supabase/server";

type WorkspaceHeaderProps = { links: Array<{ label: string; href: string }> };
const roleLabels = { student: "Student", owner: "Property owner", admin: "Administrator" } as const;
const dashboardPaths = { student: "/account", owner: "/owner", admin: "/admin" } as const;

export async function WorkspaceHeader({ links }: WorkspaceHeaderProps) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("display_name, role").eq("id", user.id).maybeSingle()
    : { data: null };
  const displayName = profile?.display_name ?? user?.email?.split("@")[0] ?? "Your account";
  const initial = displayName.trim().charAt(0).toUpperCase() || "R";
  const dashboard = profile?.role ? dashboardPaths[profile.role] : "/account";

  return (
    <header className="workspace-topbar">
      <Link className="workspace-topbar-brand" href="/" aria-label="RoomScouter home">
        <BrandLogo className="workspace-topbar-logo" />
      </Link>
      <nav aria-label="Workspace navigation">
        {links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
        <details className="profile-menu workspace-profile-menu">
          <summary aria-label={`Open profile menu for ${displayName}`}>
            <span className="profile-menu-avatar" aria-hidden="true">{initial}</span>
            <span className="profile-menu-name">{displayName}</span>
            <span className="profile-menu-chevron" aria-hidden="true">v</span>
          </summary>
          <section className="profile-card" aria-label="Your profile">
            <div className="profile-card-identity">
              <span className="profile-card-avatar" aria-hidden="true">{initial}</span>
              <div><strong>{displayName}</strong><span>{profile?.role ? roleLabels[profile.role] : "Account"}</span></div>
            </div>
            {user?.email ? <p className="profile-card-email">{user.email}</p> : null}
            <div className="profile-card-links">
              <Link href="/account">My account</Link>
              <Link href={dashboard}>Open workspace</Link>
            </div>
            <form action={logout}>
              <SubmitButton className="profile-card-logout" pendingLabel="Logging out...">Log out</SubmitButton>
            </form>
          </section>
        </details>
      </nav>
    </header>
  );
}
