import Link from "next/link";

type PublicHeaderProps = {
  current?: "home" | "browse" | "map" | "about";
};

export function PublicHeader({ current }: PublicHeaderProps) {
  return (
    <header className="public-header">
      <Link className="wordmark" href="/" aria-label="RoomScouter home">
        <span className="public-brand-mark" aria-hidden="true"><span /></span>
        <span>RoomScouter</span>
      </Link>
      <nav aria-label="Primary navigation">
        <Link aria-current={current === "home" ? "page" : undefined} href="/">Home</Link>
        <Link aria-current={current === "browse" ? "page" : undefined} href="/browse">Browse</Link>
        <Link aria-current={current === "map" ? "page" : undefined} href="/map">Map</Link>
        <Link aria-current={current === "about" ? "page" : undefined} href="/about">About</Link>
        <Link href="/login">Log in</Link>
        <Link className="button" href="/register">Create account</Link>
      </nav>
    </header>
  );
}
