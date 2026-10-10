import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "../../src/features/moderation/access";

const PAGE_SIZE = 20;
const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });
const dateFormatter = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" });

type QueueState = "pending" | "approved";
type AdminPageProps = { searchParams: Promise<{ state?: string; page?: string }> };

export const metadata: Metadata = {
  title: "Administrator dashboard | RoomScouter",
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const state: QueueState = params.state === "approved" ? "approved" : "pending";
  const rawPage = Number(params.page ?? "1");
  const page = Number.isInteger(rawPage) && rawPage > 0 && rawPage <= 10_000 ? rawPage : 1;
  const { supabase } = await requireAdmin();
  const [listingResult, accountResult, propertyResult, pendingResult, reportResult] = await Promise.all([
    supabase
      .from("boarding_houses")
      .select("id, owner_id, title, address_line, barangay, monthly_rent, available_rooms, status, submitted_at, updated_at, owner:profiles!boarding_houses_owner_id_fkey(display_name)", { count: "exact" })
      .eq("status", state)
      .order(state === "pending" ? "submitted_at" : "moderated_at", { ascending: true })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("boarding_houses").select("id", { count: "exact", head: true }),
    supabase.from("boarding_houses").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);
  const { data: listings, count } = listingResult;

  const total = count ?? 0;

  return (
    <main className="workspace-shell admin-dashboard" id="main-content" tabIndex={-1}>
      <header className="admin-dashboard-hero">
        <div className="admin-dashboard-copy">
          <p className="eyebrow">Administrator workspace</p>
          <h1>Keep RoomScouter trustworthy.</h1>
          <p className="lede">Review property submissions, respond to community reports, and protect the quality of information students rely on.</p>
        </div>
        <div className="admin-hero-actions">
          <Link className="button" href="/admin?state=pending">Review pending listings</Link>
          <Link className="button admin-hero-secondary" href="/account">Account</Link>
        </div>
      </header>

      <section className="admin-summary-grid" aria-label="Administrator overview">
        <article className="admin-summary-card admin-summary-accounts">
          <span>Registered accounts</span>
          <strong>{accountResult.count ?? 0}</strong>
          <small>Students, owners, and administrators</small>
        </article>
        <article className="admin-summary-card admin-summary-properties">
          <span>Total properties</span>
          <strong>{propertyResult.count ?? 0}</strong>
          <small>Every listing lifecycle state</small>
        </article>
        <article className="admin-summary-card admin-summary-pending">
          <span>Awaiting review</span>
          <strong>{pendingResult.count ?? 0}</strong>
          <small>Owner submissions needing a decision</small>
        </article>
        <article className="admin-summary-card admin-summary-reports">
          <span>Open reports</span>
          <strong>{reportResult.count ?? 0}</strong>
          <small>Community concerns still unresolved</small>
        </article>
      </section>

      <section className="admin-work-queues" aria-labelledby="admin-work-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Work queues</p>
            <h2 id="admin-work-heading">Choose what needs attention</h2>
          </div>
        </div>
        <div className="admin-queue-grid">
          <Link className="admin-queue-card" href="/admin?state=pending">
            <span className="admin-queue-number" aria-hidden="true">01</span>
            <strong>Listing submissions</strong>
            <span>Verify property facts before publication.</span>
          </Link>
          <Link className="admin-queue-card" href="/admin/reviews">
            <span className="admin-queue-number" aria-hidden="true">02</span>
            <strong>Review moderation</strong>
            <span>Inspect published and hidden student reviews.</span>
          </Link>
          <Link className="admin-queue-card" href="/admin/reports">
            <span className="admin-queue-number" aria-hidden="true">03</span>
            <strong>Community reports</strong>
            <span>Resolve or dismiss submitted concerns.</span>
          </Link>
        </div>
      </section>

      <section className="admin-listing-queue" aria-labelledby="listing-queue-heading">
        <div className="section-heading admin-queue-heading">
          <div>
            <p className="eyebrow">Listing moderation</p>
            <h2 id="listing-queue-heading">{state === "pending" ? "Pending review" : "Published listings"}</h2>
          </div>
          <p>{total} {total === 1 ? "listing" : "listings"}</p>
        </div>

      <nav className="moderation-tabs" aria-label="Listing moderation queues">
        <Link aria-current={state === "pending" ? "page" : undefined} className={state === "pending" ? "active" : ""} href="/admin?state=pending" scroll={false}>Pending review</Link>
        <Link aria-current={state === "approved" ? "page" : undefined} className={state === "approved" ? "active" : ""} href="/admin?state=approved" scroll={false}>Published listings</Link>
      </nav>

      {listings?.length ? (
        <div className="listing-grid">
          {listings.map((listing) => (
            <article className="listing-card" key={listing.id}>
              <div className="workspace-listing-media" aria-hidden="true">
                <img src="/roomscouter-icon.png" width="1141" height="1379" alt="" />
              </div>
              <div className="listing-card-heading">
                <h2>{listing.title}</h2>
                <span className={`status status-${listing.status}`}>{listing.status}</span>
              </div>
              <p>{listing.address_line}</p>
              <p className="field-help">Barangay: {listing.barangay || "Not provided"}</p>
              <p>{currency.format(listing.monthly_rent)} monthly · {listing.available_rooms} available</p>
              <p className="field-help">Owner: {listing.owner?.display_name ?? "Unknown owner"}</p>
              <p className="field-help">
                {state === "pending" && listing.submitted_at
                  ? `Submitted ${dateFormatter.format(new Date(listing.submitted_at))}`
                  : `Updated ${dateFormatter.format(new Date(listing.updated_at))}`}
              </p>
              <Link href={`/admin/listings/${listing.id}`}>Review listing</Link>
            </article>
          ))}
        </div>
      ) : (
        <section className="empty-state">
          <h2>{state === "pending" ? "Review queue is clear" : "No published listings"}</h2>
          <p>{state === "pending" ? "New owner submissions will appear here." : "Approved listings will appear here for later archival."}</p>
        </section>
      )}

      {(page > 1 || page * PAGE_SIZE < total) ? (
        <nav className="pagination" aria-label="Moderation queue pages">
          {page > 1 ? <Link className="button secondary" href={`/admin?state=${state}&page=${page - 1}`} scroll={false}>Previous</Link> : <span />}
          <span>Page {page}</span>
          {page * PAGE_SIZE < total ? <Link className="button secondary" href={`/admin?state=${state}&page=${page + 1}`} scroll={false}>Next</Link> : <span />}
        </nav>
      ) : null}
      </section>
    </main>
  );
}
