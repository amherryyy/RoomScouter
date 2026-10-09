import type { Metadata } from "next";
import { PolicyPage } from "../../src/components/policy-page";

export const metadata: Metadata = {
  title: "Cookie Notice | RoomScouter",
  description: "What cookies RoomScouter uses and how to manage them.",
};

export default function CookiesPage() {
  return (
    <PolicyPage
      title="Cookie Notice and Controls"
      summary="RoomScouter uses essential session cookies to keep authentication working. This pilot does not use analytics, advertising, or cross-site tracking cookies."
    >
      <section><h2>Cookies currently in use</h2><p>Supabase SSR authentication uses browser cookies to maintain and refresh a signed-in session. They are needed when you ask RoomScouter to sign in, remain signed in, or use a protected student, owner, or administrator feature. They are not used by RoomScouter for advertising, analytics, or profiling.</p><p>RoomScouter does not currently load optional analytics or advertising cookie categories, so there is no optional-cookie consent choice to save. No cookie preference cookie is needed. If optional cookies or similar tracking are introduced, the operator must update this notice and provide a meaningful choice before using them when consent is the applicable legal basis.</p></section>
      <section><h2>Managing cookies</h2><p>You can block or clear cookies through your browser’s privacy settings. If you block the essential authentication cookies, sign-in, account recovery, and protected pages may not work, and you may be signed out. Clearing them removes the browser’s current session; it does not itself delete the account or information stored by the service.</p><p>Because the current cookies are needed for a service feature you request and there are no optional cookie categories, this page does not show a misleading “accept all” or “reject all” banner. Contact the operator through the <a href="/privacy">Privacy Notice</a> once its verified contact details are published.</p></section>
      <section><h2>Third-party links</h2><p>A listing can open a map link on OpenStreetMap when you choose it. That is a navigation link, not an embedded map on this site. OpenStreetMap may use its own technologies and privacy terms after you leave RoomScouter.</p></section>
      <section><h2>Legal context</h2><p>The Philippine Data Privacy Act requires transparent, legitimate, and proportionate handling of personal information. A cookie that identifies or tracks a person can involve personal data. The operator should assess each technology by its purpose, data, and lawful basis. This pilot’s necessary session cookies support requested authentication; the current codebase contains no analytics or advertising integration.</p><p>For more about how session information and account data are handled, read the <a href="/privacy">Privacy Notice</a>.</p></section>
    </PolicyPage>
  );
}
