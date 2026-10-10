import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { SubmitButton } from "./submit-button";
import { logout } from "../features/auth/actions";
import { createServerSupabaseClient } from "../lib/supabase/server";
import { ResponsiveNavigation } from "./navigation-controls";
import { UiIcon } from "./ui-icon";
import { ThemeToggle } from "./theme-toggle";

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
  const mobileAccount = user ? (
    <>
      <Link href="/account">My account</Link>
      {profile?.role === "student" ? <>
        <Link href="/favorites">My favorites</Link>
        <Link href="/reports">My reports</Link>
      </> : null}
      {profile?.role && profile.role !== "student" ? (
        <Link href={dashboardPaths[profile.role]}>Open dashboard</Link>
      ) : null}
      <form action={logout}>
        <SubmitButton className="profile-card-logout" pendingLabel="Logging out…"><UiIcon className="ui-icon" name="logout" /><span>Log out</span></SubmitButton>
      </form>
    </>
  ) : (
    <>
      <Link href="/login">Log in</Link>
      <Link className="button" href="/register">Create account</Link>
    </>
  );

  return (
    <header className="public-header">
      <Link className="wordmark" href="/" aria-label="RoomScouter home">
        <BrandLogo className="public-wordmark-logo" />
      </Link>
      <div className="public-header-actions">
        <ThemeToggle />
        <ResponsiveNavigation
          className="public-navigation"
          displayName={user ? displayName : undefined}
          email={user?.email}
          initial={initial}
          mobileAccount={mobileAccount}
          roleLabel={profile?.role ? roleLabels[profile.role] : undefined}
        >
          <nav aria-label="Primary navigation">
          <Link aria-current={current === "home" ? "page" : undefined} href="/"><UiIcon className="ui-icon" name="home" /><span>Home</span></Link>
          <Link aria-current={current === "browse" ? "page" : undefined} href="/browse"><UiIcon className="ui-icon" name="browse" /><span>Browse</span></Link>
          <Link aria-current={current === "map" ? "page" : undefined} href="/map"><UiIcon className="ui-icon" name="map" /><span>Map</span></Link>
          <Link aria-current={current === "about" ? "page" : undefined} href="/about"><UiIcon className="ui-icon" name="info" /><span>About</span></Link>
          {user ? (
            <details className="profile-menu">
              <summary aria-label={"Open profile menu for " + displayName}>
                <span className="profile-menu-avatar" aria-hidden="true">{initial}</span>
                <span className="profile-menu-name">{displayName}</span>
                <UiIcon className="ui-icon profile-menu-chevron" name="chevron-down" />
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
                  {profile?.role === "student" ? <>
                    <Link href="/favorites">My favorites</Link>
                    <Link href="/reports">My reports</Link>
                  </> : null}
                  {profile?.role && profile.role !== "student" ? (
                    <Link href={dashboardPaths[profile.role]}>Open dashboard</Link>
                  ) : null}
                </div>
                <form action={logout}>
                  <SubmitButton className="profile-card-logout" pendingLabel="Logging out…"><UiIcon className="ui-icon" name="logout" /><span>Log out</span></SubmitButton>
                </form>
              </section>
            </details>
          ) : (
            <div className="desktop-account-actions">
              <Link href="/login">Log in</Link>
              <Link className="button" href="/register">Create account</Link>
            </div>
          )}
          </nav>
        </ResponsiveNavigation>
      </div>
    </header>
  );
}
