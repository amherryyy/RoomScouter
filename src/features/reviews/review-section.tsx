import { ReportForm } from "../reports/report-form";

type PublicReview = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type OwnReview = {
  id: string;
  rating: number;
  comment: string;
  status: "published" | "hidden";
  moderationNote: string | null;
};

type ReviewSectionProps = {
  reviews: PublicReview[];
  ownReview: OwnReview | null;
  isStudent: boolean;
  reviewCount: number;
  averageRating: number | null;
  page: number;
  hasPrevious: boolean;
  hasNext: boolean;
  listingId: string;
  saveAction: (formData: FormData) => void | Promise<void>;
  deleteAction: () => void | Promise<void>;
  reportAction: (reviewId: string, formData: FormData) => void | Promise<void>;
};

const dateFormatter = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" });

function Rating({ value }: { value: number }) {
  return (
    <span className="rating" aria-label={`${value} out of 5 stars`}>
      <span aria-hidden="true">{"★".repeat(value)}{"☆".repeat(5 - value)}</span>
    </span>
  );
}

export function ReviewSection({
  reviews,
  ownReview,
  isStudent,
  reviewCount,
  averageRating,
  page,
  hasPrevious,
  hasNext,
  listingId,
  saveAction,
  deleteAction,
  reportAction,
}: ReviewSectionProps) {
  return (
    <section className="reviews-section" id="reviews" aria-labelledby="reviews-title">
      <div className="reviews-heading">
        <div>
          <p className="eyebrow">Student experiences</p>
          <h2 id="reviews-title">Reviews</h2>
        </div>
        <p className="review-summary">
          <strong>{averageRating !== null ? averageRating.toFixed(2) : "—"}</strong>
          <span>{reviewCount} {reviewCount === 1 ? "review" : "reviews"}</span>
        </p>
      </div>

      {isStudent ? (
        <div className="review-editor">
          <h3>{ownReview ? "Update your review" : "Share your experience"}</h3>
          {ownReview?.status === "hidden" ? (
            <p className="notice error" role="status">
              This review is hidden from public view.{ownReview.moderationNote ? ` Reason: ${ownReview.moderationNote}` : ""}
            </p>
          ) : null}
          <form action={saveAction}>
            <label htmlFor="review-rating">Rating</label>
            <select id="review-rating" name="rating" defaultValue={ownReview?.rating ?? 5} required>
              {[5, 4, 3, 2, 1].map((rating) => <option value={rating} key={rating}>{rating} star{rating === 1 ? "" : "s"}</option>)}
            </select>
            <label htmlFor="review-comment">Review</label>
            <textarea id="review-comment" name="comment" defaultValue={ownReview?.comment ?? ""} minLength={3} maxLength={2000} required />
            <button type="submit">{ownReview ? "Update review" : "Publish review"}</button>
          </form>
          {ownReview ? <form action={deleteAction}><button className="danger-button" type="submit">Delete review</button></form> : null}
        </div>
      ) : null}

      {reviews.length ? (
        <div className="review-list">
          {reviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div className="review-card-heading">
                <Rating value={review.rating} />
                <time dateTime={review.createdAt}>{dateFormatter.format(new Date(review.createdAt))}</time>
              </div>
              <p>{review.comment}</p>
              <span className="field-help">Verified RoomScouter student account</span>
              {isStudent && review.id !== ownReview?.id ? (
                <ReportForm id={`review-${review.id}`} label="Report this review" action={reportAction.bind(null, review.id)} />
              ) : null}
            </article>
          ))}
        </div>
      ) : <p className="empty-state">No public reviews yet.</p>}

      {(hasPrevious || hasNext) ? (
        <nav className="pagination" aria-label="Review pages">
          {hasPrevious ? <a className="button secondary" href={`/listings/${listingId}?reviewPage=${page - 1}#reviews`}>Previous</a> : <span />}
          <span>Review page {page}</span>
          {hasNext ? <a className="button secondary" href={`/listings/${listingId}?reviewPage=${page + 1}#reviews`}>Next</a> : <span />}
        </nav>
      ) : null}
    </section>
  );
}
