export type UniversityConfig = {
  name: string;
  latitude: number;
  longitude: number;
};

export const ESTIMATED_WALKING_SPEED_KMH = 4.2;
export const ESTIMATED_BICYCLE_SPEED_KMH = 15;
export const ESTIMATED_TRICYCLE_SPEED_KMH = 20;
export const ESTIMATED_ROAD_DETOUR_FACTOR = 1.3;

export function estimateTravelTimes(straightLineDistanceKm: number): {
  walkingMinutes: number;
  bicycleMinutes: number;
  tricycleMinutes: number;
} {
  const estimatedRoadDistanceKm = Number.isFinite(straightLineDistanceKm) && straightLineDistanceKm > 0
    ? straightLineDistanceKm * ESTIMATED_ROAD_DETOUR_FACTOR
    : 0;

  const estimateMinutes = (speedKmPerHour: number) => {
    if (estimatedRoadDistanceKm <= 0) return 0;
    return Math.max(1, Math.round((estimatedRoadDistanceKm / speedKmPerHour) * 60));
  };

  return {
    walkingMinutes: estimateMinutes(ESTIMATED_WALKING_SPEED_KMH),
    bicycleMinutes: estimateMinutes(ESTIMATED_BICYCLE_SPEED_KMH),
    tricycleMinutes: estimateMinutes(ESTIMATED_TRICYCLE_SPEED_KMH),
  };
}

export function formatEstimatedDuration(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
}

export function getUniversityConfig(): UniversityConfig | null {
  const name = process.env.ROOMSCOUTER_UNIVERSITY_NAME?.trim();
  const latitudeText = process.env.ROOMSCOUTER_UNIVERSITY_LATITUDE?.trim();
  const longitudeText = process.env.ROOMSCOUTER_UNIVERSITY_LONGITUDE?.trim();

  if (!name && !latitudeText && !longitudeText) return null;
  const latitude = Number(latitudeText);
  const longitude = Number(longitudeText);
  if (
    !name
    || !latitudeText
    || !longitudeText
    || !Number.isFinite(latitude)
    || !Number.isFinite(longitude)
    || latitude < -90
    || latitude > 90
    || longitude < -180
    || longitude > 180
  ) {
    throw new Error("RoomScouter university configuration is incomplete or invalid");
  }
  return { name, latitude, longitude };
}

export function approximateDistanceKm(
  fromLatitude: number,
  fromLongitude: number,
  toLatitude: number,
  toLongitude: number,
): number {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const latitudeDelta = radians(toLatitude - fromLatitude);
  const longitudeDelta = radians(toLongitude - fromLongitude);
  const value = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(fromLatitude)) * Math.cos(radians(toLatitude))
      * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(value));
}
