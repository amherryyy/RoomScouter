import Link from "next/link";
import { SubmitButton } from "../../src/components/submit-button";
import { ROOM_TYPE_LABELS } from "../../src/features/discovery/model";
import { removeFavorite } from "../../src/features/favorites/actions";
import { requireStudent } from "../../src/features/students/access";

const PAGE_SIZE = 12;
const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });

type FavoritesPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function FavoritesPage({ searchParams }: FavoritesPageProps) {
  const rawPage = Number((await searchParams).page ?? "1");
  const page = Number.isInteger(rawPage) && rawPage > 0 && rawPage <= 10_000 ? rawPage : 1;
  const { supabase } = await requireStudent();
  const { data: favorites, count } = await supabase
    .from("favorites")
    .select(`
      created_at,
      boarding_houses!inner (
        id, title, address_line, monthly_rent, room_type, available_rooms
      )
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const total = count ?? 0;
  const hasPrevious = page > 1;
  const hasNext = page * PAGE_SIZE < total;

  return (
    <main className="workspace-shell favorites-workspace" id="main-content" tabIndex={-1}>
      <header className="workspace-heading">
        <div>
          <p className="eyebrow">Your shortlist</p>
          <h1>Saved listings</h1>
          <p className="lede">Keep promising boarding houses together while you compare your options.</p>
        </div>
        <Link className="button secondary" href="/">Find listings</Link>
      </header>

      {favorites?.length ? (
        <div className="listing-grid">
          {favorites.map((favorite) => {
            const listing = favorite.boarding_houses;
            return (
              <article className="listing-card" key={listing.id}>
                <h2><Link href={`/listings/${listing.id}`}>{listing.title}</Link></h2>
                <p>{listing.address_line}</p>
                <p>{currency.format(listing.monthly_rent)} monthly</p>
                <div className="fact-row">
                  <span>{ROOM_TYPE_LABELS[listing.room_type]}</span>
                  <span>{listing.available_rooms} available</span>
                </div>
                <div className="saved-listing-actions">
                  <Link href={`/listings/${listing.id}`}>View details</Link>
                  <form action={removeFavorite.bind(null, listing.id)}>
                    <SubmitButton pendingLabel="Removing…" className="secondary">Remove</SubmitButton>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="empty-state">
          <h2>No saved listings yet</h2>
          <p>Browse approved boarding houses and save the ones you want to compare.</p>
        </section>
      )}

      {(hasPrevious || hasNext) ? (
        <nav className="pagination" aria-label="Saved listing pages">
          {hasPrevious ? <Link className="button secondary" href={`/favorites?page=${page - 1}`}>Previous</Link> : <span />}
          <span>Page {page}</span>
          {hasNext ? <Link className="button secondary" href={`/favorites?page=${page + 1}`}>Next</Link> : <span />}
        </nav>
      ) : null}
      <p><Link href="/account">Back to account</Link></p>
    </main>
  );
}
