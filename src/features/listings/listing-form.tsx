"use client";

import { useActionState, useState } from "react";
import type { Database } from "../../lib/supabase/database.types";
import { SubmitButton } from "../../components/submit-button";
import { LocationMapPicker } from "./location-map-picker";
import { roomTypes } from "./model";
import { initialListingFormState, type ListingFormState } from "./listing-form-state";

type Listing = Database["public"]["Tables"]["boarding_houses"]["Row"];

type ListingFormProps = {
  action: (previousState: ListingFormState, formData: FormData) => Promise<ListingFormState>;
  listing?: Listing;
  submitLabel: string;
};

const roomTypeLabels = {
  bedspace: "Bedspace",
  shared_room: "Shared room",
  private_room: "Private room",
  studio: "Studio",
} as const;

export function ListingForm({ action, listing, submitLabel }: ListingFormProps) {
  const [state, formAction] = useActionState(action, initialListingFormState);
  const [latitude, setLatitude] = useState(listing?.latitude.toString() ?? "");
  const [longitude, setLongitude] = useState(listing?.longitude.toString() ?? "");
  const numericLatitude = Number(latitude);
  const numericLongitude = Number(longitude);
  const validPosition = latitude.trim() !== "" && longitude.trim() !== ""
    && Number.isFinite(numericLatitude) && Number.isFinite(numericLongitude)
    && numericLatitude >= -90 && numericLatitude <= 90
    && numericLongitude >= -180 && numericLongitude <= 180;

  return (
    <form action={formAction} className="listing-form">
      {state.message ? (
        <p className={`notice ${state.status === "error" ? "error" : "success"}`} role={state.status === "error" ? "alert" : "status"}>
          {state.message}
        </p>
      ) : null}
      <fieldset>
        <legend>Listing details</legend>
        <label htmlFor="title">Listing title</label>
        <input id="title" name="title" defaultValue={listing?.title} minLength={3} maxLength={120} required />

        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" defaultValue={listing?.description} minLength={20} maxLength={5000} rows={6} required />

        <label htmlFor="addressLine">Address</label>
        <input id="addressLine" name="addressLine" defaultValue={listing?.address_line} minLength={5} maxLength={240} required />

        <label htmlFor="barangay">Barangay</label>
        <input id="barangay" name="barangay" defaultValue={listing?.barangay ?? ""} minLength={2} maxLength={80} autoComplete="address-level3" required />

        <div className="form-grid">
          <div>
            <label htmlFor="monthlyRent">Monthly rent (PHP)</label>
            <input id="monthlyRent" name="monthlyRent" type="number" defaultValue={listing?.monthly_rent} min="0" max="99999999.99" step="0.01" required />
          </div>
          <div>
            <label htmlFor="roomType">Room type</label>
            <select id="roomType" name="roomType" defaultValue={listing?.room_type ?? "private_room"} required>
              {roomTypes.map((roomType) => <option key={roomType} value={roomType}>{roomTypeLabels[roomType]}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="availableRooms">Available rooms</label>
            <input id="availableRooms" name="availableRooms" type="number" defaultValue={listing?.available_rooms ?? 1} min="0" max="1000" step="1" required />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Contact details</legend>
        <label htmlFor="contactName">Contact name</label>
        <input id="contactName" name="contactName" defaultValue={listing?.contact_name} maxLength={80} required />
        <div className="form-grid">
          <div>
            <label htmlFor="contactPhone">Phone</label>
            <input id="contactPhone" name="contactPhone" type="tel" autoComplete="tel" defaultValue={listing?.contact_phone ?? ""} maxLength={30} aria-describedby="contact-help" />
          </div>
          <div>
            <label htmlFor="contactEmail">Email</label>
            <input id="contactEmail" name="contactEmail" type="email" autoComplete="email" defaultValue={listing?.contact_email ?? ""} maxLength={254} aria-describedby="contact-help" />
          </div>
        </div>
        <p className="field-help" id="contact-help">Provide at least one contact method. It becomes public only with an approved listing.</p>
      </fieldset>

      <fieldset>
        <legend>Property location</legend>
        <p className="field-help" id="map-help">Find your property on the map, then tap its location. Drag the pin if it needs adjusting.</p>
        <LocationMapPicker
          initialLatitude={validPosition ? numericLatitude : null}
          initialLongitude={validPosition ? numericLongitude : null}
          onChange={(nextLatitude, nextLongitude) => {
            setLatitude(nextLatitude.toFixed(6));
            setLongitude(nextLongitude.toFixed(6));
          }}
        />
        <input type="hidden" name="latitude" value={latitude} />
        <input type="hidden" name="longitude" value={longitude} />
        <details className="location-manual-entry">
          <summary>Enter coordinates manually</summary>
          <div className="form-grid">
            <div>
              <label htmlFor="latitude-manual">Latitude</label>
              <input id="latitude-manual" type="number" value={latitude} min="-90" max="90" step="0.000001" onChange={(event) => setLatitude(event.currentTarget.value)} />
            </div>
            <div>
              <label htmlFor="longitude-manual">Longitude</label>
              <input id="longitude-manual" type="number" value={longitude} min="-180" max="180" step="0.000001" onChange={(event) => setLongitude(event.currentTarget.value)} />
            </div>
          </div>
        </details>
      </fieldset>

      <SubmitButton disabled={!validPosition} pendingLabel="Saving listing…">{submitLabel}</SubmitButton>
    </form>
  );
}
