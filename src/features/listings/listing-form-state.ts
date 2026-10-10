export type ListingFormState = {
  status: "idle" | "error" | "success";
  message: string;
};

export type ListingAvailabilityState = {
  status: "idle" | "error" | "success";
  message: string;
  availableRooms: number;
};
export const initialListingFormState: ListingFormState = {
  status: "idle",
  message: "",
};
