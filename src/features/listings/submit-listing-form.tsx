"use client";

import { useActionState } from "react";
import { SubmitButton } from "../../components/submit-button";
import { ActionNotice } from "./action-notice";
import { initialListingFormState, type ListingFormState } from "./listing-form-state";

type SubmitListingFormProps = {
  action: (previousState: ListingFormState, formData: FormData) => Promise<ListingFormState>;
};

export function SubmitListingForm({ action }: SubmitListingFormProps) {
  const [state, formAction] = useActionState(action, initialListingFormState);

  return (
    <form action={formAction}>
      <ActionNotice state={state} />
      <SubmitButton pendingLabel="Submitting for review…">Submit for review</SubmitButton>
    </form>
  );
}
