import Link from "next/link";
import type { ReactNode } from "react";

type AuthPageProps = {
  titleId: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthPage({ titleId, eyebrow, title, description, children, footer }: AuthPageProps) {
  return (
    <main className="auth-shell" id="main-content" tabIndex={-1}>
      <div className="auth-layout">
        <aside className="auth-story" aria-label="About RoomScouter">
          <Link className="auth-brand" href="/" aria-label="RoomScouter home">
            <span className="auth-brand-mark" aria-hidden="true"><span /></span>
            <span>RoomScouter</span>
          </Link>
          <div className="auth-story-copy">
            <p className="eyebrow">Student housing, made clearer</p>
            <h2>Find a room with facts you can compare.</h2>
            <p>Explore approved local listings, understand the details, and choose with more confidence.</p>
          </div>
          <ul className="auth-benefits">
            <li>Administrator-reviewed listings</li>
            <li>Comparable rent, amenities, and availability</li>
            <li>Role-protected student and owner workspaces</li>
          </ul>
        </aside>

        <section className="auth-card" aria-labelledby={titleId}>
          <Link className="auth-mobile-brand" href="/" aria-label="RoomScouter home">
            <span className="auth-brand-mark" aria-hidden="true"><span /></span>
            <span>RoomScouter</span>
          </Link>
          <p className="eyebrow">{eyebrow}</p>
          <h1 id={titleId}>{title}</h1>
          <p className="auth-description">{description}</p>
          {children}
          <footer className="auth-footer">{footer}</footer>
        </section>
      </div>
    </main>
  );
}
