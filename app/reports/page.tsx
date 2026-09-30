import Link from "next/link";
import { requireStudent } from "../../src/features/students/access";

const PAGE_SIZE = 20;
const dateFormatter = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" });

type ReportsPageProps = { searchParams: Promise<{ page?: string }> };

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const rawPage = Number((await searchParams).page ?? "1");
  const page = Number.isInteger(rawPage) && rawPage > 0 && rawPage <= 10_000 ? rawPage : 1;
  const { supabase } = await requireStudent();
  const { data: reports, count } = await supabase
    .from("reports")
    .select("id, target_type, boarding_house_id, review_id, reason, status, resolution_note, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const reviewIds = (reports ?? []).flatMap((report) => report.review_id ? [report.review_id] : []);
  const { data: reviewTargets } = reviewIds.length
    ? await supabase.from("public_reviews").select("id, boarding_house_id").in("id", reviewIds)
    : { data: [] };
  const reviewListingIds = new Map((reviewTargets ?? []).flatMap((review) => (
    review.id && review.boarding_house_id ? [[review.id, review.boarding_house_id] as const] : []
  )));
  const listingIds = [...new Set((reports ?? []).flatMap((report) => {
    const listingId = report.boarding_house_id ?? (report.review_id ? reviewListingIds.get(report.review_id) : null);
    return listingId ? [listingId] : [];
  }))];
  const { data: listings } = listingIds.length
    ? await supabase.from("boarding_houses").select("id, title").in("id", listingIds)
    : { data: [] };
  const listingTitles = new Map((listings ?? []).map((listing) => [listing.id, listing.title]));
  const total = count ?? 0;

  return (
    <main className="workspace-shell" id="main-content" tabIndex={-1}>
      <header className="workspace-heading">
        <div>
          <p className="eyebrow">Private submissions</p>
          <h1>Your reports</h1>
          <p className="lede">Track concerns you sent to RoomScouter administrators.</p>
        </div>
        <Link className="button secondary" href="/">Browse listings</Link>
      </header>

      {reports?.length ? (
        <div className="report-history">
          {reports.map((report) => {
            const listingId = report.boarding_house_id ?? (report.review_id ? reviewListingIds.get(report.review_id) : null);
            return (
              <article className="report-card" key={report.id}>
                <div className="listing-card-heading">
                  <h2>{report.target_type === "listing" ? "Listing report" : "Review report"}</h2>
                  <span className={`status status-${report.status}`}>{report.status}</span>
                </div>
                <p>{report.reason}</p>
                <p className="field-help">Submitted {dateFormatter.format(new Date(report.created_at))}</p>
                {report.resolution_note ? <p><strong>Administrator response:</strong> {report.resolution_note}</p> : null}
                {listingId && listingTitles.has(listingId) ? (
                  <Link href={`/listings/${listingId}`}>View {listingTitles.get(listingId)}</Link>
                ) : <span className="field-help">The reported content is no longer public.</span>}
              </article>
            );
          })}
        </div>
      ) : (
        <section className="empty-state"><h2>No reports submitted</h2><p>Your private report history will appear here.</p></section>
      )}

      {(page > 1 || page * PAGE_SIZE < total) ? (
        <nav className="pagination" aria-label="Report history pages">
          {page > 1 ? <Link className="button secondary" href={`/reports?page=${page - 1}`}>Previous</Link> : <span />}
          <span>Page {page}</span>
          {page * PAGE_SIZE < total ? <Link className="button secondary" href={`/reports?page=${page + 1}`}>Next</Link> : <span />}
        </nav>
      ) : null}
      <p><Link href="/account">Back to account</Link></p>
    </main>
  );
}
