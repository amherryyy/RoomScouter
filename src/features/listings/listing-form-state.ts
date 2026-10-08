export type ListingFormState = {
  status: "idle" | "error" | "success";
  message: string;
};

export const initialListingFormState: ListingFormState = {
  status: "idle",
  message: "",
};
