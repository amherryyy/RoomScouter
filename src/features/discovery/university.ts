export type UniversityConfig = {
  name: string;
  latitude: number;
  longitude: number;
};

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
