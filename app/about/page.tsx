import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "../../src/components/public-header";
import { UiIcon } from "../../src/components/ui-icon";

export const metadata: Metadata = {
  title: "About | RoomScouter",
  description: "Learn what RoomScouter does and how listings become publicly visible.",
};

export default function AboutPage() {
  return (
    <main className="discovery-shell preview-page about-page" id="main-content" tabIndex={-1}>
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
        <Link className="button" href="/browse">Start browsing</Link>
      </section>

      <div className="about-resource-grid">
        <section className="about-resource-card" id="contact" aria-labelledby="contact-title">
          <UiIcon className="ui-icon about-resource-icon" name="mail" />
          <p className="eyebrow">Contact</p>
          <h2 id="contact-title">Contact us</h2>
          <p>Questions or feedback? Email the RoomScouter team or reach us through GitHub.</p>
          <div className="about-resource-links">
            <a href="mailto:mhracads@gmail.com"><UiIcon className="ui-icon" name="mail" /> mhracads@gmail.com</a>
            <a href="https://github.com/amherryyy"><UiIcon className="ui-icon" name="github" /> Developer profile</a>
            <a href="https://github.com/amherryyy/RoomScouter"><UiIcon className="ui-icon" name="github" /> Project on GitHub</a>
          </div>
        </section>

        <section className="about-resource-card" id="help" aria-labelledby="help-title">
          <UiIcon className="ui-icon about-resource-icon" name="help" />
          <p className="eyebrow">Help</p>
          <h2 id="help-title">Guides and FAQs are coming</h2>
          <p>This is where RoomScouter tutorials and answers to common questions will live. For now, report a problem and review your message before submitting it to GitHub.</p>
          <div className="about-resource-links">
            <Link href="/report-problem"><UiIcon className="ui-icon" name="reports" /> Report a problem</Link>
          </div>
        </section>

        <section className="about-resource-card" id="license" aria-labelledby="license-title">
          <UiIcon className="ui-icon about-resource-icon" name="license" />
          <p className="eyebrow">Open source</p>
          <h2 id="license-title">MIT License</h2>
          <p>The MIT License permits use, copying, modification, distribution, sublicensing, and sale, subject to its terms and copyright notice.</p>
          <div className="about-resource-links">
            <a href="https://github.com/amherryyy/RoomScouter/blob/main/LICENSE"><UiIcon className="ui-icon" name="license" /> Read the full license</a>
          </div>
        </section>
      </div>
    </main>
  );
}
