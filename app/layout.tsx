import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Script from "next/script";
import { UiIcon } from "../src/components/ui-icon";
import "leaflet/dist/leaflet.css";
import "./styles.css";

export const metadata: Metadata = {
  title: "RoomScouter",
  description: "Find and compare approved boarding houses near Nueva Vizcaya State University."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="roomscouter-theme-init" strategy="beforeInteractive">
          {`try{const saved=localStorage.getItem("roomscouter-theme");const dark=saved?saved==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.dataset.theme=dark?"dark":"light"}catch{document.documentElement.dataset.theme="light"}`}
        </Script>
      </head>
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
              <Link href="/about#contact">Contact us</Link>
              <Link href="/report-problem">Report a problem</Link>
            </nav>
            <nav aria-label="Project">
              <strong>Project</strong>
              <a href="https://github.com/amherryyy/RoomScouter">View on GitHub</a>
              <Link href="/about#license">MIT License</Link>
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
