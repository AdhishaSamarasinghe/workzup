"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix default icon issues with Leaflet in Webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LocationMapProps {
  position: { lat: number; lng: number };
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: LocationMapProps["onLocationSelect"] }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      // Reverse geocode using Nominatim OpenStreetMap API
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        onLocationSelect(lat, lng, data.display_name || "");
      } catch (err) {
        console.error("Reverse geocode failed", err);
        onLocationSelect(lat, lng, "");
      }
    },
  });
  return null;
}

export default function LocationMap({ position, onLocationSelect }: LocationMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    if (map) {
      map.setView([position.lat, position.lng], map.getZoom());
    }
  }, [position, map]);

  return (
    <MapContainer
      center={[position.lat, position.lng]}
      zoom={13}
      style={{ width: "100%", height: "250px" }}
      ref={setMap}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[position.lat, position.lng]} />
      <MapClickHandler onLocationSelect={onLocationSelect} />
    </MapContainer>
  );
}
