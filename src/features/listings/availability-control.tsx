"use client";

import { useActionState } from "react";
import { updateListingAvailability } from "./actions";
import type { ListingAvailabilityState } from "./listing-form-state";

export function AvailabilityControl({
  listingId,
  title,
  initialAvailableRooms,
}: {
  listingId: string;
  title: string;
  initialAvailableRooms: number;
}) {
  const initialState: ListingAvailabilityState = {
    status: "idle",
    message: "",
    availableRooms: initialAvailableRooms,
  };
  const [state, formAction, isPending] = useActionState(
    updateListingAvailability.bind(null, listingId),
    initialState,
  );

  return (
    <div className="owner-listing-availability">
      <form action={formAction} className="availability-control" aria-label={"Availability for " + title}>
        <input type="hidden" name="currentRooms" value={state.availableRooms} />
        <span className="availability-label">Available rooms</span>
        <div className="availability-stepper">
          <button aria-label={"Remove one available room from " + title} disabled={isPending || state.availableRooms === 0} name="intent" type="submit" value="decrease">-</button>
          <output aria-live="polite" className="availability-count">{state.availableRooms}</output>
          <button aria-label={"Add one available room to " + title} disabled={isPending || state.availableRooms === 1000} name="intent" type="submit" value="increase">+</button>
          <button className="availability-full" disabled={isPending || state.availableRooms === 0} name="intent" type="submit" value="full">Mark full</button>
        </div>
        <span className="availability-hint">Set to 0 when full to hide it from room searches.</span>
        {state.message ? (
          <span className={"availability-message" + (state.status === "error" ? " is-error" : "")} role={state.status === "error" ? "alert" : "status"}>
            {state.message}
          </span>
        ) : null}
      </form>
    </div>
  );
}