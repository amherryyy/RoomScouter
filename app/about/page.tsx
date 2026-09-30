import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "../../src/components/public-header";

export const metadata: Metadata = {
  title: "About | RoomScouter",
  description: "Learn what RoomScouter does and how listings become publicly visible.",
};

export default function AboutPage() {
  return (
    <main className="discovery-shell preview-page" id="main-content" tabIndex={-1}>
      <PublicHeader current="about" />
      <section className="preview-hero">
        <p className="eyebrow">About RoomScouter</p>
        <h1>Better information for a safer room search.</h1>
        <p className="lede">
          RoomScouter helps students compare boarding houses near Nueva Vizcaya State University while giving
          property owners a structured way to publish accurate information.
        </p>
      </section>

      <div className="about-grid">
        <section>
          <p className="step-number" aria-hidden="true">1</p>
          <h2>Owners provide details</h2>
          <p>Owners prepare listings with rent, availability, facilities, utilities, rules, contact details, and photos.</p>
        </section>
        <section>
          <p className="step-number" aria-hidden="true">2</p>
          <h2>Administrators review</h2>
          <p>Listings remain private until an administrator reviews and approves the submitted information.</p>
        </section>
        <section>
          <p className="step-number" aria-hidden="true">3</p>
          <h2>Students compare</h2>
          <p>Students search approved options, save favorites, publish reviews, and privately report concerns.</p>
        </section>
      </div>

      <section className="scope-note">
        <div>
          <p className="eyebrow">Clear boundaries</p>
          <h2>RoomScouter supports discovery—not transactions.</h2>
          <p>Students contact owners directly. RoomScouter does not process reservations, rental agreements, or payments.</p>
        </div>
        <Link className="button" href="/#browse">Start browsing</Link>
      </section>
    </main>
  );
}
