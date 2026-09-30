import { moderateListing } from "./actions";

type ListingControlsProps = {
  listingId: string;
  status: "draft" | "pending" | "approved" | "rejected" | "archived";
};

export function ListingControls({ listingId, status }: ListingControlsProps) {
  if (status === "pending") {
    const approveAction = moderateListing.bind(null, listingId, "approved");
    const rejectAction = moderateListing.bind(null, listingId, "rejected");
    return (
      <section className="moderation-controls" aria-labelledby="moderation-actions-title">
        <h2 id="moderation-actions-title">Moderation decision</h2>
        <p>Approval publishes the listing immediately. Review every detail before continuing.</p>
        <form action={approveAction}>
          <button type="submit">Approve and publish</button>
        </form>
        <form action={rejectAction} className="moderation-reason-form">
          <label htmlFor="rejection-reason">Reason for rejection</label>
          <textarea id="rejection-reason" name="reason" minLength={5} maxLength={1000} required />
          <p className="field-help">The owner will see this guidance before correcting the listing.</p>
          <button className="danger-button" type="submit">Reject listing</button>
        </form>
      </section>
    );
  }

  if (status === "approved") {
    const archiveAction = moderateListing.bind(null, listingId, "archived");
    return (
      <section className="moderation-controls" aria-labelledby="moderation-actions-title">
        <h2 id="moderation-actions-title">Archive published listing</h2>
        <p>Archiving removes this listing from public discovery.</p>
        <form action={archiveAction} className="moderation-reason-form">
          <label htmlFor="archive-reason">Reason for archival</label>
          <textarea id="archive-reason" name="reason" minLength={5} maxLength={1000} required />
          <button className="danger-button" type="submit">Archive listing</button>
        </form>
      </section>
    );
  }

  return (
    <section className="moderation-controls">
      <h2>No decision available</h2>
      <p>This listing must be pending to approve or reject it, or approved to archive it.</p>
    </section>
  );
}
