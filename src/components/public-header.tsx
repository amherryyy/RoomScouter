import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { SubmitButton } from "./submit-button";
import { logout } from "../features/auth/actions";
import { createServerSupabaseClient } from "../lib/supabase/server";

type PublicHeaderProps = {
  current?: "home" | "browse" | "map" | "about";
};

const roleLabels = {
  student: "Student",
  owner: "Property owner",
  admin: "Administrator",
} as const;

const dashboardPaths = {
  student: "/account",
  owner: "/owner",
  admin: "/admin",
} as const;

export async function PublicHeader({ current }: PublicHeaderProps) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("display_name, role").eq("id", user.id).maybeSingle()
    : { data: null };
  const displayName = profile?.display_name ?? user?.email?.split("@")[0] ?? "Your account";
  const initial = displayName.trim().charAt(0).toUpperCase() || "R";

  return (
    <header className="public-header">
      <Link className="wordmark" href="/" aria-label="RoomScouter home">
        <BrandLogo className="public-wordmark-logo" />
      </Link>
      <nav aria-label="Primary navigation">
        <Link aria-current={current === "home" ? "page" : undefined} href="/">Home</Link>
        <Link aria-current={current === "browse" ? "page" : undefined} href="/browse">Browse</Link>
        <Link aria-current={current === "map" ? "page" : undefined} href="/map">Map</Link>
        <Link aria-current={current === "about" ? "page" : undefined} href="/about">About</Link>
        {user ? (
          <details className="profile-menu">
            <summary aria-label={`Open profile menu for ${displayName}`}>
              <span className="profile-menu-avatar" aria-hidden="true">{initial}</span>
              <span className="profile-menu-name">{displayName}</span>
              <span className="profile-menu-chevron" aria-hidden="true">⌄</span>
            </summary>
            <section className="profile-card" aria-label="Your profile">
              <div className="profile-card-identity">
                <span className="profile-card-avatar" aria-hidden="true">{initial}</span>
                <div>
                  <strong>{displayName}</strong>
                  <span>{profile?.role ? roleLabels[profile.role] : "Account"}</span>
                </div>
              </div>
              {user.email ? <p className="profile-card-email">{user.email}</p> : null}
              <div className="profile-card-links">
                <Link href="/account">My account</Link>
                {profile?.role && profile.role !== "student" ? (
                  <Link href={dashboardPaths[profile.role]}>Open {profile.role === "owner" ? "owner" : "admin"} dashboard</Link>
                ) : null}
              </div>
              <form action={logout}>
                <SubmitButton className="profile-card-logout" pendingLabel="Logging out…">Log out</SubmitButton>
              </form>
            </section>
          </details>
        ) : (
          <>
            <Link href="/login">Log in</Link>
            <Link className="button" href="/register">Create account</Link>
          </>
        )}
      </nav>
    </header>
  );
}
