import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
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
          <p>RoomScouter helps students discover boarding-house information.</p>
          <nav aria-label="Policies">
            <Link href="/terms">Terms of Use</Link>
            <Link href="/privacy">Privacy Notice</Link>
            <Link href="/cookies">Cookie Notice</Link>
          </nav>
        </footer>
      </body>
    </html>
  );
}
