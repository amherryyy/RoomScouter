export const roomTypes = ["bedspace", "shared_room", "private_room", "studio"] as const;

export type RoomType = (typeof roomTypes)[number];

export type ListingInput = {
  title: string;
  description: string;
  address_line: string;
  barangay: string;
  monthly_rent: number;
  room_type: RoomType;
  available_rooms: number;
  contact_name: string;
  contact_phone: string | null;
  contact_email: string | null;
  latitude: number;
  longitude: number;
};

type ParseResult =
  | { ok: true; value: ListingInput }
  | { ok: false; message: string };

function text(value: FormDataEntryValue | null, minimum: number, maximum: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length >= minimum && normalized.length <= maximum ? normalized : null;
}

function optionalText(value: FormDataEntryValue | null, minimum: number, maximum: number) {
  if (typeof value !== "string" || value.trim() === "") return null;
  return text(value, minimum, maximum);
}

function numberInRange(value: FormDataEntryValue | null, minimum: number, maximum: number) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum ? parsed : null;
}

function integerInRange(value: FormDataEntryValue | null, minimum: number, maximum: number) {
  const parsed = numberInRange(value, minimum, maximum);
  return parsed !== null && Number.isInteger(parsed) ? parsed : null;
}

function email(value: FormDataEntryValue | null): string | null {
  const parsed = optionalText(value, 3, 254);
  return parsed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed) ? parsed : null;
}

export function parseListingInput(formData: FormData): ParseResult {
  const title = text(formData.get("title"), 3, 120);
  const description = text(formData.get("description"), 20, 5000);
  const addressLine = text(formData.get("addressLine"), 5, 240);
  const barangay = text(formData.get("barangay"), 2, 80);
  const monthlyRent = numberInRange(formData.get("monthlyRent"), 0, 99_999_999.99);
  const roomTypeValue = formData.get("roomType");
  const roomType =
    typeof roomTypeValue === "string" && roomTypes.includes(roomTypeValue as RoomType)
      ? roomTypeValue as RoomType
      : null;
  const availableRooms = integerInRange(formData.get("availableRooms"), 0, 1000);
  const contactName = text(formData.get("contactName"), 1, 80);
  const rawPhone = formData.get("contactPhone");
  const rawEmail = formData.get("contactEmail");
  const contactPhone = optionalText(rawPhone, 7, 30);
  const contactEmail = email(rawEmail);
  const latitude = numberInRange(formData.get("latitude"), -90, 90);
  const longitude = numberInRange(formData.get("longitude"), -180, 180);

  const suppliedInvalidPhone = typeof rawPhone === "string" && rawPhone.trim() !== "" && !contactPhone;
  const suppliedInvalidEmail = typeof rawEmail === "string" && rawEmail.trim() !== "" && !contactEmail;

  if (
    !title ||
    !description ||
    !addressLine ||
    !barangay ||
    monthlyRent === null ||
    !roomType ||
    availableRooms === null ||
    !contactName ||
    suppliedInvalidPhone ||
    suppliedInvalidEmail ||
    (!contactPhone && !contactEmail) ||
    latitude === null ||
    longitude === null
  ) {
    return { ok: false, message: "Check every field and provide at least one valid contact method." };
  }

  return {
    ok: true,
    value: {
      title,
      description,
      address_line: addressLine,
      barangay,
      monthly_rent: monthlyRent,
      room_type: roomType,
      available_rooms: availableRooms,
      contact_name: contactName,
      contact_phone: contactPhone,
      contact_email: contactEmail,
      latitude,
      longitude,
    },
  };
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
