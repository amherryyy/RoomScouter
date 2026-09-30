import { createServerSupabaseClient } from "../../lib/supabase/server";
import { DISCOVERY_PAGE_SIZE, type DiscoveryFilters } from "./model";
import type { UniversityConfig } from "./university";

export async function loadDiscovery(filters: DiscoveryFilters, university: UniversityConfig | null) {
  const supabase = await createServerSupabaseClient();
  const effectiveDistance = university ? filters.maximumDistanceKm : null;
  const [{ data: results, error }, { data: facilities }, { data: utilities }] = await Promise.all([
    supabase.rpc("search_public_boarding_houses", {
      search_text: filters.query || undefined,
      maximum_monthly_rent: filters.maximumRent ?? undefined,
      minimum_available_rooms: filters.minimumRooms,
      selected_room_type: filters.roomType ?? undefined,
      selected_facility_id: filters.facilityId ?? undefined,
      selected_utility_id: filters.utilityId ?? undefined,
      university_latitude: university?.latitude,
      university_longitude: university?.longitude,
      maximum_distance_km: effectiveDistance ?? undefined,
      page_size: DISCOVERY_PAGE_SIZE,
      page_offset: (filters.page - 1) * DISCOVERY_PAGE_SIZE,
    }),
    supabase.from("facilities").select("id, name").order("name"),
    supabase.from("utilities").select("id, name").order("name"),
  ]);
  if (error) throw new Error("Public listings could not be loaded", { cause: error });

  const rows = results ?? [];
  const listingIds = rows.map((listing) => listing.id);
  const { data: coverPhotos } = listingIds.length
    ? await supabase
      .from("listing_photos")
      .select("boarding_house_id, object_path, alt_text")
      .in("boarding_house_id", listingIds)
      .eq("position", 1)
    : { data: [] };
  const covers = new Map<string, { altText: string; signedUrl: string }>();
  const photos = coverPhotos ?? [];
  if (photos.length) {
    const { data: signedPhotos } = await supabase.storage
      .from("listing-photos")
      .createSignedUrls(photos.map((photo) => photo.object_path), 60 * 60);
    const signedUrls = new Map(
      (signedPhotos ?? []).flatMap((photo) => photo.signedUrl ? [[photo.path, photo.signedUrl] as const] : []),
    );
    photos.forEach((photo) => {
      const signedUrl = signedUrls.get(photo.object_path);
      if (signedUrl) covers.set(photo.boarding_house_id, { altText: photo.alt_text, signedUrl });
    });
  }

  return {
    results: rows.map((listing) => ({ ...listing, cover: covers.get(listing.id) ?? null })),
    facilities: facilities ?? [],
    utilities: utilities ?? [],
    total: Number(rows[0]?.total_count ?? 0),
  };
}
