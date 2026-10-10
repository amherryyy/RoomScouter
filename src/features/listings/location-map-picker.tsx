"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";

const BAYOMBONG_CENTER: [number, number] = [16.4816, 121.1497];

export function LocationMapPicker({
  initialLatitude,
  initialLongitude,
  onChange,
}: {
  initialLatitude: number | null;
  initialLongitude: number | null;
  onChange: (latitude: number, longitude: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const initialPositionRef = useRef({ initialLatitude, initialLongitude });
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [hasPin, setHasPin] = useState(initialLatitude !== null && initialLongitude !== null);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let map: LeafletMap | null = null;
    let marker: Marker | null = null;
    let leaflet: typeof import("leaflet") | null = null;

    const { initialLatitude: latitude, initialLongitude: longitude } = initialPositionRef.current;
    const hasInitialPosition = latitude !== null && longitude !== null
      && Number.isFinite(latitude) && Number.isFinite(longitude);
    const initialPosition: [number, number] = hasInitialPosition
      ? [latitude, longitude]
      : BAYOMBONG_CENTER;

    const selectPosition = (nextLatitude: number, nextLongitude: number) => {
      if (!map || !leaflet) return;
      const position: [number, number] = [nextLatitude, nextLongitude];
      if (!marker) {
        marker = leaflet.marker(position, {
          alt: "Boarding house location. Drag to adjust.",
          draggable: true,
          icon: leaflet.divIcon({
            className: "property-location-marker",
            html: '<span class="property-location-pin"></span>',
            iconSize: [30, 38],
            iconAnchor: [15, 36],
          }),
        }).addTo(map);
        marker.on("dragend", () => {
          const moved = marker?.getLatLng();
          if (!moved) return;
          onChangeRef.current(moved.lat, moved.lng);
          setHasPin(true);
        });
      } else {
        marker.setLatLng(position);
      }
      onChangeRef.current(nextLatitude, nextLongitude);
      setHasPin(true);
    };

    void import("leaflet").then(({ default: L }) => {
      if (cancelled || !containerRef.current) return;
      leaflet = L;
      map = L.map(containerRef.current, {
        center: initialPosition,
        zoom: hasInitialPosition ? 16 : 14,
        minZoom: 11,
        maxZoom: 19,
        scrollWheelZoom: false,
      });
      const tileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL
        || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
      const attribution = process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION
        || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>';
      L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(map);
      map.on("click", (event) => selectPosition(event.latlng.lat, event.latlng.lng));
      if (hasInitialPosition) selectPosition(initialPosition[0], initialPosition[1]);
      setMapReady(true);
      setMapError(false);
    }).catch(() => {
      if (!cancelled) setMapError(true);
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  return (
    <div className="location-picker">
      <div
        aria-label="Map. Tap or click to place the property pin, then drag it to adjust."
        aria-busy={!mapReady && !mapError ? "true" : undefined}
        className="location-picker-map"
        ref={containerRef}
        role="region"
      />
      {!mapReady && !mapError ? <p className="location-picker-loading" role="status">Loading map...</p> : null}
      <p className="field-help" aria-live="polite">
        {mapError
          ? "The map could not load. Check your connection and try again."
          : hasPin
            ? "Pin placed. Tap the map or drag the pin to adjust the location."
            : "Tap the map where your property is. You can drag the pin to adjust it."}
      </p>
    </div>
  );
}