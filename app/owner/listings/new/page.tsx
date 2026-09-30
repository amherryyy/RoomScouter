import Link from "next/link";
import { createListing } from "../../../../src/features/listings/actions";
import { requireOwner } from "../../../../src/features/listings/access";
import { ListingForm } from "../../../../src/features/listings/listing-form";

type NewListingPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewListingPage({ searchParams }: NewListingPageProps) {
  await requireOwner();
  const { error } = await searchParams;

  return (
    <main className="workspace-shell narrow-workspace" id="main-content" tabIndex={-1}>
      <p className="eyebrow">Owner workspace</p>
      <h1>Create a listing</h1>
      <p className="lede">Start with the facts students need to compare options. You can add facilities, utilities, rules, and photos next.</p>
      {error ? <p className="notice error" role="alert">{error}</p> : null}
      <ListingForm action={createListing} submitLabel="Create draft" />
      <p><Link href="/owner">Cancel and return to listings</Link></p>
    </main>
  );
}
