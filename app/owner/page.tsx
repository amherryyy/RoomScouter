import type { Metadata } from "next";
import Link from "next/link";
import { requireOwner } from "../../src/features/listings/access";
import { AvailabilityControl } from "../../src/features/listings/availability-control";

const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });
const statusLabels = {
  draft: "Draft",
  pending: "Pending review",
  approved: "Published",
  rejected: "Needs changes",
  archived: "Archived",
} as const;

export const metadata: Metadata = {
  title: "Owner dashboard | RoomScouter",
};

export default async function OwnerDashboardPage() {
  const { supabase } = await requireOwner();
  const { data: listings } = await supabase
    .from("boarding_houses")
    .select("id, title, barangay, status, monthly_rent, available_rooms, updated_at")
    .order("updated_at", { ascending: false });
  const ownerListings = listings ?? [];
  const summary = {
    total: ownerListings.length,
    draft: ownerListings.filter((listing) => listing.status === "draft").length,
    pending: ownerListings.filter((listing) => listing.status === "pending").length,
    approved: ownerListings.filter((listing) => listing.status === "approved").length,
    rejected: ownerListings.filter((listing) => listing.status === "rejected").length,
  };

  return (
    <main className="workspace-shell owner-workspace" id="main-content" tabIndex={-1}>
      <header className="workspace-heading">
        <div>
          <p className="eyebrow">Owner workspace</p>
          <h1>Owner dashboard</h1>
          <p className="lede">Create accurate drafts, track review status, and keep availability current.</p>
        </div>
        <div className="actions">
          <Link className="button secondary" href="/account">Account</Link>
          <Link className="button" href="/owner/listings/new">Create listing</Link>
        </div>
      </header>

      <section className="dashboard-summary-grid" aria-label="Listing status summary">
        <article className="dashboard-summary-card">
          <span>Total properties</span>
          <strong>{summary.total}</strong>
        </article>
        <article className="dashboard-summary-card status-summary-draft">
          <span>Private drafts</span>
          <strong>{summary.draft}</strong>
        </article>
        <article className="dashboard-summary-card status-summary-pending">
          <span>Pending review</span>
          <strong>{summary.pending}</strong>
        </article>
        <article className="dashboard-summary-card status-summary-approved">
          <span>Published</span>
          <strong>{summary.approved}</strong>
        </article>
        <article className="dashboard-summary-card status-summary-rejected">
          <span>Needs changes</span>
          <strong>{summary.rejected}</strong>
        </article>
      </section>

      <section className="section-heading owner-listings-heading">
        <div>
          <p className="eyebrow">Properties</p>
          <h2>Your listings</h2>
        </div>
      </section>

      {ownerListings.length ? (
        <div className="listing-grid">
          {ownerListings.map((listing) => (
            <article className="listing-card" key={listing.id}>
              <div className="workspace-listing-media" aria-hidden="true">
                <img src="/roomscouter-icon.png" width="1141" height="1379" alt="" />
              </div>
              <div className="listing-card-heading">
                <h2>{listing.title}</h2>
                <span className={`status status-${listing.status}`}>{statusLabels[listing.status]}</span>
              </div>
              <p>{listing.barangay || "Barangay not added yet"}</p>
              <p>{currency.format(listing.monthly_rent)} monthly</p>
              <AvailabilityControl
                initialAvailableRooms={listing.available_rooms}
                listingId={listing.id}
                title={listing.title}
              />
              <Link href={`/owner/listings/${listing.id}/edit`}>Edit and review details</Link>
            </article>
          ))}
        </div>
      ) : (
        <section className="empty-state">
          <h2>No listings yet</h2>
          <p>Create a draft when you are ready. Nothing becomes public without administrator approval.</p>
        </section>
      )}

      <section className="owner-future-note" aria-labelledby="owner-insights-heading">
        <div>
          <p className="preview-badge">Under construction</p>
          <h2 id="owner-insights-heading">Views and inquiries</h2>
          <p>RoomScouter does not currently track property views or store student-owner conversations. Those figures will appear only after the team approves their privacy and product requirements.</p>
        </div>
      </section>
    </main>
  );
}
