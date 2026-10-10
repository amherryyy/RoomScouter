import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { UiIcon } from "../src/components/ui-icon";
import "leaflet/dist/leaflet.css";
import "./styles.css";

export const metadata: Metadata = {
  title: "RoomScouter",
  description: "Find and compare approved boarding houses near Nueva Vizcaya State University."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        {children}
        <footer className="site-footer">
          <div className="site-footer-brand">
            <p>RoomScouter helps students discover boarding-house information.</p>
            <p className="site-footer-copyright"><UiIcon className="ui-icon" name="copyright" /> <span>2026 RoomScouter contributors. All rights reserved.</span></p>
          </div>
          <div className="site-footer-links">
            <nav aria-label="Help and feedback">
              <strong>Help &amp; feedback</strong>
              <Link href="/about#help">Help</Link>
              <Link href="/contact?type=contact">Contact developers</Link>
              <Link href="/contact?type=problem">Report a problem</Link>
            </nav>
            <nav aria-label="Project">
              <strong>Project</strong>
              <a href="https://github.com/amherryyy/RoomScouter">View on GitHub</a>
              <a href="https://github.com/amherryyy/RoomScouter/blob/main/LICENSE">MIT License</a>
            </nav>
            <nav aria-label="Policies">
              <strong>Policies</strong>
              <Link href="/terms">Terms of Use</Link>
              <Link href="/privacy">Privacy Notice</Link>
              <Link href="/cookies">Cookie Notice</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
