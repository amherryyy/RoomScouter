import type { ReactNode } from "react";
import { PublicHeader } from "./public-header";

type PolicyPageProps = {
  title: string;
  summary: string;
  children: ReactNode;
};

export function PolicyPage({ title, summary, children }: PolicyPageProps) {
  return (
    <main className="discovery-shell policy-page" id="main-content" tabIndex={-1}>
      <PublicHeader />
      <header className="policy-heading">
        <p className="eyebrow">RoomScouter pilot policies · Updated October 9, 2026</p>
        <h1>{title}</h1>
        <p className="lede">{summary}</p>
      </header>
      <article className="policy-content">{children}</article>
    </main>
  );
}
