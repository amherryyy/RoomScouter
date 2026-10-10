"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type {
  GeoJSON as LeafletGeoJSON,
  LayersControlEvent,
  Map as LeafletMap,
  Marker,
} from "leaflet";
import { ROOM_TYPE_LABELS, type RoomType } from "../features/discovery/model";
import type { UniversityConfig } from "../features/discovery/university";

export type MapListing = {
  id: string;
  title: string;
  address_line: string;
  barangay: string | null;
  monthly_rent: number;
  room_type: RoomType;
  available_rooms: number;
  latitude: number;
  longitude: number;
  approximate_distance_km: number | null;
};

const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

export function InteractiveListingMap({
  listings,
  university,
  total,
}: {
  listings: MapListing[];
  university: UniversityConfig | null;
  total: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const markersRef = useRef(new Map<string, Marker>());
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const firstListing = listings[0];
  const centerLatitude = university?.latitude ?? firstListing?.latitude ?? null;
  const centerLongitude = university?.longitude ?? firstListing?.longitude ?? null;

  useEffect(() => {
    let cancelled = false;
    if (centerLatitude === null || centerLongitude === null || !containerRef.current) return;

    void import("leaflet").then(({ default: L }) => {
      if (cancelled || !containerRef.current) return;
      leafletRef.current = L;
      const map = L.map(containerRef.current, {
        center: [centerLatitude, centerLongitude],
        zoom: 14,
        minZoom: 11,
        maxZoom: 19,
        scrollWheelZoom: false,
        zoomControl: true,
      });
      const tileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL
        || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
      const attribution = process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION
        || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>';
      const satelliteTileUrl = process.env.NEXT_PUBLIC_MAP_SATELLITE_TILE_URL
        || "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      const satelliteAttribution = process.env.NEXT_PUBLIC_MAP_SATELLITE_ATTRIBUTION
        || "Sources: Esri, Maxar, Earthstar Geographics, and the GIS User Community";

      const streetLayer = L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(map);
      const satelliteLayer = L.tileLayer(satelliteTileUrl, {
        attribution: satelliteAttribution,
        maxZoom: 19,
      });
      const boundaryStyles = {
        street: {
          color: "#246b48",
          weight: 1.6,
          opacity: 0.78,
          dashArray: "6 5",
          lineCap: "round" as const,
          lineJoin: "round" as const,
          fillColor: "#43a86f",
          fillOpacity: 0.02,
        },
        satellite: {
          color: "#f4fff7",
          weight: 2,
          opacity: 0.94,
          lineCap: "round" as const,
          lineJoin: "round" as const,
          fillColor: "#43a86f",
          fillOpacity: 0.18,
        },
      };
      let activeBasemapName = "Street map";
      let barangayLayer: LeafletGeoJSON | null = null;
      map.on("baselayerchange", (event: LayersControlEvent) => {
        activeBasemapName = event.name;
        map.getContainer().classList.toggle("is-satellite-view", event.name === "Satellite");
        barangayLayer?.setStyle(
          event.name === "Satellite" ? boundaryStyles.satellite : boundaryStyles.street,
        );
      });
      L.control.layers(
        { "Street map": streetLayer, Satellite: satelliteLayer },
        undefined,
        { collapsed: false },
      ).addTo(map);
      void fetch("/data/bayombong-barangays.geojson")
        .then((response) => {
          if (!response.ok) throw new Error(`Barangay boundaries request failed (${response.status})`);
          return response.json();
        })
        .then((data) => {
          if (cancelled) return;
          barangayLayer = L.geoJSON(data, {
            style: boundaryStyles.street,
            onEachFeature: (feature, layer) => {
              const barangayName = feature.properties?.brgy_name;
              if (typeof barangayName === "string" && barangayName.trim()) {
                layer.bindTooltip(barangayName, {
                  direction: "center",
                  permanent: true,
                  className: "barangay-map-label",
                  interactive: false,
                  opacity: 1,
                });
              }
            },
          });
          if (activeBasemapName === "Satellite") {
            barangayLayer.setStyle(boundaryStyles.satellite);
          }
          barangayLayer.addTo(map);
        })
        .catch((error: unknown) => {
          if (!cancelled) console.error("Failed to load Bayombong barangay boundaries.", error);
        });
      if (university) {
        const campusMarker = document.createElement("span");
        campusMarker.className = "university-map-marker";
        campusMarker.setAttribute("aria-hidden", "true");
        const campusDot = document.createElement("span");
        campusDot.className = "university-map-dot";
        const campusLabel = document.createElement("span");
        campusLabel.className = "university-map-label";
        campusLabel.textContent = university.name;
        campusMarker.append(campusDot, campusLabel);
        L.marker([university.latitude, university.longitude], {
          alt: `${university.name} campus`,
          title: `${university.name} campus`,
          icon: L.divIcon({
            className: "university-map-marker-icon",
            html: campusMarker,
            iconAnchor: [10, 16],
          }),
        }).addTo(map);
      }

      mapRef.current = map;
      setMapError(false);
      setMapReady(true);
    }).catch(() => {
      if (!cancelled) setMapError(true);
    });

    return () => {
      cancelled = true;
      markersRef.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
      setMapReady(false);
    };
  }, [centerLatitude, centerLongitude, university]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!mapReady || !L || !map) return;

    const markerLayer = L.layerGroup().addTo(map);
    const markers = new Map<string, Marker>();
    const bounds = L.latLngBounds([]);

    for (const listing of listings) {
      const priceLabel = currency.format(listing.monthly_rent);
      const marker = L.marker([listing.latitude, listing.longitude], {
        alt: `${listing.title}, ${priceLabel} per month`,
        riseOnHover: true,
        icon: L.divIcon({
          className: "map-price-marker",
          html: `<span class="map-price-pin">${priceLabel}</span>`,
          iconSize: [96, 38],
          iconAnchor: [48, 38],
        }),
      });
      marker.on("click", () => setSelectedId(listing.id));
      marker.addTo(markerLayer);
      markers.set(listing.id, marker);
      bounds.extend([listing.latitude, listing.longitude]);
    }

    markersRef.current = markers;
    if (university) bounds.extend([university.latitude, university.longitude]);
    if (bounds.isValid()) {
      if (bounds.getNorthEast().equals(bounds.getSouthWest())) map.setView(bounds.getCenter(), 15);
      else map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 });
    }

    return () => {
      markerLayer.remove();
      markersRef.current = new Map();
    };
  }, [listings, mapReady, university]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !selectedId) return;
    const selectedMarker = markersRef.current.get(selectedId);
    if (!selectedMarker) return;

    for (const [id, marker] of markersRef.current) {
      marker.getElement()?.classList.toggle("map-price-marker-active", id === selectedId);
      marker.setZIndexOffset(id === selectedId ? 1000 : 0);
    }
    const selectedZoom = Math.max(map.getZoom(), 15);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      map.setView(selectedMarker.getLatLng(), selectedZoom);
    } else {
      map.flyTo(selectedMarker.getLatLng(), selectedZoom, { duration: 0.45 });
    }
  }, [mapReady, selectedId]);

  const selectListing = (listing: MapListing) => {
    setSelectedId(listing.id);
  };

  return (
    <div className="map-discovery-layout">
      <section className="map-canvas-panel" aria-label="Map of available listings">
        {centerLatitude !== null && centerLongitude !== null ? (
          <div className="map-canvas-frame">
            <div className="map-canvas" ref={containerRef} role="region" aria-label="Interactive RoomScouter map" aria-busy={!mapReady} />
            {!mapReady ? <p className="map-canvas-status" role={mapError ? "alert" : undefined}>{mapError ? "The map could not load. You can still browse the matching listings." : "Loading map…"}</p> : null}
          </div>
        ) : (
          <div className="map-canvas-unavailable">
            <strong>Map location is not configured yet.</strong>
            <span>Listings will appear here after the university location is configured.</span>
          </div>
        )}
        <p className="map-attribution-note">Barangay boundaries: Philippine Statistics Authority (PSA), via GeoRisk.</p>
        <p className="visually-hidden" aria-live="polite">
          {selectedId ? `Selected ${listings.find((listing) => listing.id === selectedId)?.title ?? "listing"} on map.` : "Select a listing marker or result to see it on the map."}
        </p>
      </section>

      <section className="map-results-panel" aria-labelledby="map-results-title">
        <div className="map-results-heading">
          <div>
            <p className="eyebrow">Approved and available</p>
            <h2 id="map-results-title">Listings on this page</h2>
          </div>
          <span>{listings.length} of {total}</span>
        </div>
        {listings.length ? (
          <ul className="map-results-list">
            {listings.map((listing) => (
              <li key={listing.id}>
                <article className={`map-result-card${selectedId === listing.id ? " is-selected" : ""}`}>
                  <div className="map-result-card-heading">
                    <h3><Link href={`/listings/${listing.id}`}>{listing.title}</Link></h3>
                    <strong>{currency.format(listing.monthly_rent)}<span> / month</span></strong>
                  </div>
                  <p>{listing.barangay ? `${listing.barangay} · ` : ""}{listing.address_line}</p>
                  <div className="map-result-facts">
                    <span>{ROOM_TYPE_LABELS[listing.room_type]}</span>
                    <span>{listing.available_rooms} available</span>
                    {listing.approximate_distance_km !== null ? <span>About {listing.approximate_distance_km} km from campus</span> : null}
                  </div>
                  <button
                    aria-pressed={selectedId === listing.id}
                    className="map-result-select"
                    onClick={() => selectListing(listing)}
                    type="button"
                  >
                    {selectedId === listing.id ? "Selected on map" : "Show on map"}
                  </button>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state map-results-empty">
            <h3>No listings match those filters</h3>
            <p>Broaden your search or adjust the filters to see available places.</p>
          </div>
        )}
      </section>
    </div>
  );
}
