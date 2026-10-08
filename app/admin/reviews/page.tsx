import Link from "next/link";
import { SubmitButton } from "../../../src/components/submit-button";
import { requireAdmin } from "../../../src/features/moderation/access";
import { moderateReview } from "../../../src/features/moderation/review-actions";

const PAGE_SIZE = 20;
const dateFormatter = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" });
type ReviewState = "published" | "hidden";
type AdminReviewsPageProps = { searchParams: Promise<{ state?: string; page?: string; error?: string; message?: string }> };

export default async function AdminReviewsPage({ searchParams }: AdminReviewsPageProps) {
  const params = await searchParams;
  const state: ReviewState = params.state === "hidden" ? "hidden" : "published";
  const rawPage = Number(params.page ?? "1");
  const page = Number.isInteger(rawPage) && rawPage > 0 && rawPage <= 10_000 ? rawPage : 1;
  const { supabase } = await requireAdmin();
  const { data: reviews, count } = await supabase
    .from("reviews")
    .select("id, boarding_house_id, rating, comment, status, moderation_note, created_at, updated_at", { count: "exact" })
    .eq("status", state)
    .order("updated_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const listingIds = [...new Set((reviews ?? []).map((review) => review.boarding_house_id))];
  const { data: listings } = listingIds.length
    ? await supabase.from("boarding_houses").select("id, title").in("id", listingIds)
    : { data: [] };
  const listingTitles = new Map((listings ?? []).map((listing) => [listing.id, listing.title]));
  const total = count ?? 0;

  return (
    <main className="workspace-shell" id="main-content" tabIndex={-1}>
      <header className="workspace-heading">
        <div>
          <p className="eyebrow">Administrator workspace</p>
          <h1>Review moderation</h1>
          <p className="lede">Remove unsafe reviews from public view and restore content after reconsideration.</p>
        </div>
        <div className="actions">
          <Link className="button secondary" href="/admin/reports">Handle reports</Link>
          <Link className="button secondary" href="/admin">Listing moderation</Link>
        </div>
      </header>
      {params.error ? <p className="notice error" role="alert">{params.error}</p> : null}
      {params.message ? <p className="notice success" role="status">{params.message}</p> : null}

      <nav className="moderation-tabs" aria-label="Review moderation queues">
        <Link aria-current={state === "published" ? "page" : undefined} className={state === "published" ? "active" : ""} href="/admin/reviews?state=published" scroll={false}>Published reviews</Link>
        <Link aria-current={state === "hidden" ? "page" : undefined} className={state === "hidden" ? "active" : ""} href="/admin/reviews?state=hidden" scroll={false}>Hidden reviews</Link>
      </nav>

      {reviews?.length ? (
        <div className="admin-review-list">
          {reviews.map((review) => {
            const action = moderateReview.bind(null, review.id, review.boarding_house_id, state === "published" ? "hidden" : "published");
            return (
              <article className="review-card admin-review-card" key={review.id}>
                <div className="review-card-heading">
                  <div>
                    <span className="rating" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                    <h2>{listingTitles.get(review.boarding_house_id) ?? "Unavailable listing"}</h2>
                  </div>
                  <span className={`status status-${review.status}`}>{review.status}</span>
                </div>
                <p>{review.comment}</p>
                <p className="field-help">Submitted {dateFormatter.format(new Date(review.created_at))}</p>
                {review.moderation_note ? <p><strong>Current moderation note:</strong> {review.moderation_note}</p> : null}
                <form action={action} className="moderation-reason-form">
                  <label htmlFor={`reason-${review.id}`}>{state === "published" ? "Reason for hiding" : "Reason for restoring"}</label>
                  <textarea id={`reason-${review.id}`} name="reason" minLength={3} maxLength={1000} required />
                  <div className="review-moderation-actions">
                    <Link href={`/listings/${review.boarding_house_id}`}>View listing</Link>
                    <SubmitButton
                      className={state === "published" ? "danger-button" : ""}
                      pendingLabel={state === "published" ? "Hiding review…" : "Restoring review…"}
                    >
                      {state === "published" ? "Hide review" : "Restore review"}
                    </SubmitButton>
                  </div>
                </form>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="empty-state"><h2>No {state} reviews</h2><p>Reviews in this state will appear here.</p></section>
      )}

      {(page > 1 || page * PAGE_SIZE < total) ? (
        <nav className="pagination" aria-label="Review moderation pages">
          {page > 1 ? <Link className="button secondary" href={`/admin/reviews?state=${state}&page=${page - 1}`} scroll={false}>Previous</Link> : <span />}
          <span>Page {page}</span>
          {page * PAGE_SIZE < total ? <Link className="button secondary" href={`/admin/reviews?state=${state}&page=${page + 1}`} scroll={false}>Next</Link> : <span />}
        </nav>
      ) : null}
    </main>
  );
}
