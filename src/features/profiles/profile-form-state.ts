export type ProfileFormState = { status: "idle" | "error" | "success"; message: string };
export const initialProfileFormState: ProfileFormState = { status: "idle", message: "" };
