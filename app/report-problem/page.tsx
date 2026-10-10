import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "../../src/components/public-header";
import { ProblemReportForm } from "../../src/components/developer-feedback-form";

export const metadata: Metadata = {
  title: "Report a problem | RoomScouter",
  description: "Describe a RoomScouter problem and prepare a GitHub issue.",
};

export default function ReportProblemPage() {
  return (
    <main className="discovery-shell preview-page contact-page" id="main-content" tabIndex={-1}>
      <PublicHeader current="about" />
      <section className="contact-page-hero" aria-labelledby="report-problem-title">
        <p className="eyebrow">Problem report</p>
        <h1 id="report-problem-title">Tell us what went wrong.</h1>
        <p className="lede">Describe the issue here, then review the report in GitHub before submitting it.</p>
      </section>
      <ProblemReportForm />
      <p className="contact-back-link"><Link href="/about#help">Back to Help</Link></p>
    </main>
  );
}
