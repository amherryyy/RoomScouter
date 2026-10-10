import Form from "next/form";
import Link from "next/link";
import { SubmitButton } from "./submit-button";
import { UiIcon } from "./ui-icon";
import { ROOM_TYPE_LABELS, ROOM_TYPES, type DiscoveryFilters } from "../features/discovery/model";
import type { UniversityConfig } from "../features/discovery/university";

type DiscoveryOption = { id: number; name: string };

type DiscoveryFiltersFormProps = {
  action: "/browse" | "/map";
  filters: DiscoveryFilters;
  facilities: DiscoveryOption[];
  utilities: DiscoveryOption[];
  barangays: string[];
  university: UniversityConfig | null;
  className?: string;
};

export function DiscoveryFiltersForm({
  action,
  filters,
  facilities,
  utilities,
  barangays,
  university,
  className = "",
}: DiscoveryFiltersFormProps) {
  return (
    <Form className={`discovery-filters ${className}`.trim()} action={action} aria-label="Filter boarding houses">
      <div className="search-field">
        <label htmlFor={`${action.slice(1)}-q`}>Search by name, address, barangay, or description</label>
        <input id={`${action.slice(1)}-q`} name="q" defaultValue={filters.query} maxLength={120} placeholder="Try a street or barangay" />
      </div>
      <div>
        <label htmlFor={`${action.slice(1)}-barangay`}>Barangay</label>
        <select id={`${action.slice(1)}-barangay`} name="barangay" defaultValue={filters.barangay}>
          <option value="">Any barangay</option>
          {barangays.map((barangay) => <option value={barangay} key={barangay}>{barangay}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor={`${action.slice(1)}-maximumRent`}>Maximum monthly rent</label>
        <input id={`${action.slice(1)}-maximumRent`} name="maximumRent" type="number" min="0" max="1000000" step="100" defaultValue={filters.maximumRent ?? ""} />
      </div>
      <div>
        <label htmlFor={`${action.slice(1)}-minimumRooms`}>Rooms needed</label>
        <input id={`${action.slice(1)}-minimumRooms`} name="minimumRooms" type="number" min="1" max="1000" defaultValue={filters.minimumRooms} />
      </div>
      <div>
        <label htmlFor={`${action.slice(1)}-roomType`}>Room type</label>
        <select id={`${action.slice(1)}-roomType`} name="roomType" defaultValue={filters.roomType ?? ""}>
          <option value="">Any room type</option>
          {ROOM_TYPES.map((type) => <option value={type} key={type}>{ROOM_TYPE_LABELS[type]}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor={`${action.slice(1)}-facility`}>Facility</label>
        <select id={`${action.slice(1)}-facility`} name="facility" defaultValue={filters.facilityId ?? ""}>
          <option value="">Any facility</option>
          {facilities.map((facility) => <option value={facility.id} key={facility.id}>{facility.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor={`${action.slice(1)}-utility`}>Utility</label>
        <select id={`${action.slice(1)}-utility`} name="utility" defaultValue={filters.utilityId ?? ""}>
          <option value="">Any utility</option>
          {utilities.map((utility) => <option value={utility.id} key={utility.id}>{utility.name}</option>)}
        </select>
      </div>
      {university ? (
        <div>
          <label htmlFor={`${action.slice(1)}-maximumDistance`}>Maximum distance from {university.name}</label>
          <select id={`${action.slice(1)}-maximumDistance`} name="maximumDistance" defaultValue={filters.maximumDistanceKm ?? ""}>
            <option value="">Any distance</option>
            {[1, 2, 5, 10, 20].map((distance) => <option value={distance} key={distance}>{distance} km</option>)}
          </select>
        </div>
      ) : null}
      <div className="filter-actions">
        <SubmitButton pendingLabel="Searching…"><UiIcon className="ui-icon" name="search" /><span>Show listings</span></SubmitButton>
        <Link className="button secondary" href={action}><UiIcon className="ui-icon" name="clear" /><span>Clear</span></Link>
      </div>
    </Form>
  );
}
