import Link from "next/link";
import { SubmitButton } from "../../../src/components/submit-button";
import { requireAdmin } from "../../../src/features/moderation/access";
import { resolveReport } from "../../../src/features/moderation/report-actions";

const PAGE_SIZE = 20;
const dateFormatter = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" });
type ReportState = "open" | "resolved" | "dismissed";
type AdminReportsPageProps = { searchParams: Promise<{ state?: string; page?: string; error?: string; message?: string }> };

export default async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
  const params = await searchParams;
  const state: ReportState = params.state === "resolved" || params.state === "dismissed" ? params.state : "open";
  const rawPage = Number(params.page ?? "1");
  const page = Number.isInteger(rawPage) && rawPage > 0 && rawPage <= 10_000 ? rawPage : 1;
  const { supabase } = await requireAdmin();
  const { data: reports, count } = await supabase
    .from("reports")
    .select("id, target_type, boarding_house_id, review_id, reason, status, resolution_note, resolved_at, created_at", { count: "exact" })
    .eq("status", state)
    .order(state === "open" ? "created_at" : "resolved_at", { ascending: state === "open" })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const reviewIds = (reports ?? []).flatMap((report) => report.review_id ? [report.review_id] : []);
  const { data: reviews } = reviewIds.length
    ? await supabase.from("reviews").select("id, boarding_house_id, rating, comment, status").in("id", reviewIds)
    : { data: [] };
  const reviewById = new Map((reviews ?? []).map((review) => [review.id, review]));
  const listingIds = [...new Set((reports ?? []).flatMap((report) => {
    const listingId = report.boarding_house_id ?? (report.review_id ? reviewById.get(report.review_id)?.boarding_house_id : null);
    return listingId ? [listingId] : [];
  }))];
  const { data: listings } = listingIds.length
    ? await supabase.from("boarding_houses").select("id, title, status").in("id", listingIds)
    : { data: [] };
  const listingById = new Map((listings ?? []).map((listing) => [listing.id, listing]));
  const total = count ?? 0;

  return (
    <main className="workspace-shell" id="main-content" tabIndex={-1}>
      <header className="workspace-heading">
        <div>
          <p className="eyebrow">Administrator workspace</p>
          <h1>Report queue</h1>
          <p className="lede">Investigate student concerns and record a clear, final outcome for every case.</p>
        </div>
        <div className="actions">
          <Link className="button secondary" href="/admin">Listings</Link>
          <Link className="button secondary" href="/admin/reviews">Reviews</Link>
        </div>
      </header>
      {params.error ? <p className="notice error" role="alert">{params.error}</p> : null}
      {params.message ? <p className="notice success" role="status">{params.message}</p> : null}

      <nav className="moderation-tabs" aria-label="Report queues">
        <Link aria-current={state === "open" ? "page" : undefined} className={state === "open" ? "active" : ""} href="/admin/reports?state=open" scroll={false}>Open</Link>
        <Link aria-current={state === "resolved" ? "page" : undefined} className={state === "resolved" ? "active" : ""} href="/admin/reports?state=resolved" scroll={false}>Resolved</Link>
        <Link aria-current={state === "dismissed" ? "page" : undefined} className={state === "dismissed" ? "active" : ""} href="/admin/reports?state=dismissed" scroll={false}>Dismissed</Link>
      </nav>

      {reports?.length ? (
        <div className="report-history">
          {reports.map((report) => {
            const review = report.review_id ? reviewById.get(report.review_id) : null;
            const listingId = report.boarding_house_id ?? review?.boarding_house_id;
            const listing = listingId ? listingById.get(listingId) : null;
            const resolveAction = resolveReport.bind(null, report.id, "resolved");
            const dismissAction = resolveReport.bind(null, report.id, "dismissed");
            return (
              <article className="report-card admin-report-card" key={report.id}>
                <div className="listing-card-heading">
                  <div>
                    <p className="eyebrow">{report.target_type} report</p>
                    <h2>{listing?.title ?? "Unavailable content"}</h2>
                  </div>
                  <span className={`status status-${report.status}`}>{report.status}</span>
                </div>
                <p><strong>Student concern:</strong> {report.reason}</p>
                <p className="field-help">Submitted {dateFormatter.format(new Date(report.created_at))}</p>
                {review ? (
                  <blockquote className="reported-review">
                    <span className="rating" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                    <p>{review.comment}</p>
                    <span className={`status status-${review.status}`}>{review.status}</span>
                  </blockquote>
                ) : null}
                {listingId ? <p><Link href={`/admin/listings/${listingId}`}>Inspect listing</Link></p> : null}
                {state === "open" ? (
                  <div className="report-resolution-grid">
                    <form action={resolveAction} className="moderation-reason-form">
                      <label htmlFor={`resolve-${report.id}`}>Resolution note</label>
                      <textarea id={`resolve-${report.id}`} name="note" minLength={3} maxLength={1000} required />
                      <SubmitButton pendingLabel="Resolving report…">Mark resolved</SubmitButton>
                    </form>
                    <form action={dismissAction} className="moderation-reason-form">
                      <label htmlFor={`dismiss-${report.id}`}>Dismissal explanation</label>
                      <textarea id={`dismiss-${report.id}`} name="note" minLength={3} maxLength={1000} required />
                      <SubmitButton pendingLabel="Dismissing report…" className="secondary">Dismiss report</SubmitButton>
                    </form>
                  </div>
                ) : (
                  <div className="report-outcome">
                    <strong>Recorded outcome</strong>
                    <p>{report.resolution_note}</p>
                    {report.resolved_at ? <p className="field-help">Closed {dateFormatter.format(new Date(report.resolved_at))}</p> : null}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <section className="empty-state"><h2>No {state} reports</h2><p>Reports in this state will appear here.</p></section>
      )}

      {(page > 1 || page * PAGE_SIZE < total) ? (
        <nav className="pagination" aria-label="Report queue pages">
          {page > 1 ? <Link className="button secondary" href={`/admin/reports?state=${state}&page=${page - 1}`} scroll={false}>Previous</Link> : <span />}
          <span>Page {page}</span>
          {page * PAGE_SIZE < total ? <Link className="button secondary" href={`/admin/reports?state=${state}&page=${page + 1}`} scroll={false}>Next</Link> : <span />}
        </nav>
      ) : null}
    </main>
  );
}
