import Link from "next/link";
import { requireOwner } from "../../src/features/listings/access";

const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

export default async function OwnerDashboardPage() {
  const { supabase } = await requireOwner();
  const { data: listings } = await supabase
    .from("boarding_houses")
    .select("id, title, status, monthly_rent, available_rooms, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <main className="workspace-shell">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">Owner workspace</p>
          <h1>Your listings</h1>
          <p className="lede">Create accurate drafts, track review status, and keep availability current.</p>
        </div>
        <Link className="button" href="/owner/listings/new">Create listing</Link>
      </div>

      {listings?.length ? (
        <div className="listing-grid">
          {listings.map((listing) => (
            <article className="listing-card" key={listing.id}>
              <div className="listing-card-heading">
                <h2>{listing.title}</h2>
                <span className={`status status-${listing.status}`}>{listing.status}</span>
              </div>
              <p>{currency.format(listing.monthly_rent)} monthly · {listing.available_rooms} available</p>
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

      <p><Link href="/account">Back to account</Link></p>
    </main>
  );
}
