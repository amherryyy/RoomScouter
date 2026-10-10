import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "../../src/components/public-header";
import { DeveloperFeedbackForm } from "../../src/components/developer-feedback-form";

export const metadata: Metadata = {
  title: "Contact the developers | RoomScouter",
  description: "Contact the RoomScouter developers or report a problem.",
};

type ContactPageProps = {
  searchParams: Promise<{ type?: string | string[] }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const initialKind = params.type === "problem" ? "problem" : "contact";

  return (
    <main className="discovery-shell preview-page contact-page" id="main-content" tabIndex={-1}>
      <PublicHeader current="about" />
      <section className="contact-page-hero" aria-labelledby="contact-page-title">
        <p className="eyebrow">Help &amp; feedback</p>
        <h1 id="contact-page-title">Send a message to the developers.</h1>
        <p className="lede">Write your message here, then review it in GitHub before submitting it as an issue.</p>
      </section>
      <DeveloperFeedbackForm initialKind={initialKind} />
      <p className="contact-back-link"><Link href="/about#help">Back to Help</Link></p>
    </main>
  );
}
