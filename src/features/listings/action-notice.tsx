import type { ListingFormState } from "./listing-form-state";

export function ActionNotice({ state }: { state: ListingFormState }) {
  if (!state.message) return null;

  return (
    <p className={`notice ${state.status === "error" ? "error" : "success"}`} role={state.status === "error" ? "alert" : "status"}>
      {state.message}
    </p>
  );
}
