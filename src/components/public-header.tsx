import Link from "next/link";

type PublicHeaderProps = {
  current?: "home" | "map" | "about";
};

export function PublicHeader({ current }: PublicHeaderProps) {
  return (
    <header className="public-header">
      <Link className="wordmark" href="/">RoomScouter</Link>
      <nav aria-label="Primary navigation">
        <Link aria-current={current === "home" ? "page" : undefined} href="/">Home</Link>
        <Link href="/#browse">Browse</Link>
        <Link aria-current={current === "map" ? "page" : undefined} href="/map">Map</Link>
        <Link aria-current={current === "about" ? "page" : undefined} href="/about">About</Link>
        <Link href="/login">Log in</Link>
        <Link className="button" href="/register">Create account</Link>
      </nav>
    </header>
  );
}
