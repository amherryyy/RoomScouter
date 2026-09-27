import type { Database } from "../../lib/supabase/database.types";

export const DISCOVERY_PAGE_SIZE = 12;

export const ROOM_TYPES = ["bedspace", "shared_room", "private_room", "studio"] as const;
export type RoomType = Database["public"]["Enums"]["room_type"];

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  bedspace: "Bedspace",
  shared_room: "Shared room",
  private_room: "Private room",
  studio: "Studio",
};

type RawSearchParams = Record<string, string | string[] | undefined>;

export type DiscoveryFilters = {
  query: string;
  maximumRent: number | null;
  minimumRooms: number;
  roomType: RoomType | null;
  facilityId: number | null;
  utilityId: number | null;
  maximumDistanceKm: number | null;
  page: number;
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function boundedNumber(value: string, minimum: number, maximum: number): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum ? parsed : null;
}

export function parseDiscoveryFilters(params: RawSearchParams): DiscoveryFilters {
  const roomType = first(params.roomType);
  return {
    query: first(params.q).trim().slice(0, 120),
    maximumRent: boundedNumber(first(params.maximumRent), 0, 1_000_000),
    minimumRooms: boundedNumber(first(params.minimumRooms), 1, 1000) ?? 1,
    roomType: ROOM_TYPES.includes(roomType as RoomType) ? roomType as RoomType : null,
    facilityId: boundedNumber(first(params.facility), 1, 32_767),
    utilityId: boundedNumber(first(params.utility), 1, 32_767),
    maximumDistanceKm: boundedNumber(first(params.maximumDistance), 0.1, 500),
    page: Math.floor(boundedNumber(first(params.page), 1, 10_000) ?? 1),
  };
}

export function discoveryQuery(filters: DiscoveryFilters, page: number): string {
  const query = new URLSearchParams();
  if (filters.query) query.set("q", filters.query);
  if (filters.maximumRent !== null) query.set("maximumRent", String(filters.maximumRent));
  if (filters.minimumRooms !== 1) query.set("minimumRooms", String(filters.minimumRooms));
  if (filters.roomType) query.set("roomType", filters.roomType);
  if (filters.facilityId !== null) query.set("facility", String(filters.facilityId));
  if (filters.utilityId !== null) query.set("utility", String(filters.utilityId));
  if (filters.maximumDistanceKm !== null) query.set("maximumDistance", String(filters.maximumDistanceKm));
  if (page > 1) query.set("page", String(page));
  return query.toString();
}
