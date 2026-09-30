import Link from "next/link";
import { requireAdmin } from "../../src/features/moderation/access";

const PAGE_SIZE = 20;
const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });
const dateFormatter = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" });

type QueueState = "pending" | "approved";
type AdminPageProps = { searchParams: Promise<{ state?: string; page?: string }> };

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const state: QueueState = params.state === "approved" ? "approved" : "pending";
  const rawPage = Number(params.page ?? "1");
  const page = Number.isInteger(rawPage) && rawPage > 0 && rawPage <= 10_000 ? rawPage : 1;
  const { supabase } = await requireAdmin();
  const { data: listings, count } = await supabase
    .from("boarding_houses")
    .select("id, owner_id, title, address_line, monthly_rent, available_rooms, status, submitted_at, updated_at", { count: "exact" })
    .eq("status", state)
    .order(state === "pending" ? "submitted_at" : "moderated_at", { ascending: true })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const ownerIds = [...new Set((listings ?? []).map((listing) => listing.owner_id))];
  const { data: owners } = ownerIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", ownerIds)
    : { data: [] };
  const ownerNames = new Map((owners ?? []).map((owner) => [owner.id, owner.display_name]));
  const total = count ?? 0;

  return (
    <main className="workspace-shell">
      <header className="workspace-heading">
        <div>
          <p className="eyebrow">Administrator workspace</p>
          <h1>Listing moderation</h1>
          <p className="lede">Review submissions before publication and retire listings that should no longer be public.</p>
        </div>
        <div className="actions">
          <Link className="button secondary" href="/admin/reviews">Moderate reviews</Link>
          <Link className="button secondary" href="/account">Account</Link>
        </div>
      </header>

      <nav className="moderation-tabs" aria-label="Listing moderation queues">
        <Link className={state === "pending" ? "active" : ""} href="/admin?state=pending">Pending review</Link>
        <Link className={state === "approved" ? "active" : ""} href="/admin?state=approved">Published listings</Link>
      </nav>

      {listings?.length ? (
        <div className="listing-grid">
          {listings.map((listing) => (
            <article className="listing-card" key={listing.id}>
              <div className="listing-card-heading">
                <h2>{listing.title}</h2>
                <span className={`status status-${listing.status}`}>{listing.status}</span>
              </div>
              <p>{listing.address_line}</p>
              <p>{currency.format(listing.monthly_rent)} monthly · {listing.available_rooms} available</p>
              <p className="field-help">Owner: {ownerNames.get(listing.owner_id) ?? "Unknown owner"}</p>
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
          {page > 1 ? <Link className="button secondary" href={`/admin?state=${state}&page=${page - 1}`}>Previous</Link> : <span />}
          <span>Page {page}</span>
          {page * PAGE_SIZE < total ? <Link className="button secondary" href={`/admin?state=${state}&page=${page + 1}`}>Next</Link> : <span />}
        </nav>
      ) : null}
    </main>
  );
}
