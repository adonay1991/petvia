"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { Button } from "@petvia/ui";
import { Phone } from "lucide-react";

// Types
export interface ClinicMapItem {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  is_24h: boolean;
  has_emergency: boolean;
  latitude: number;
  longitude: number;
  distance_km?: number;
}

interface ClinicMapProps {
  clinics: ClinicMapItem[];
  userLocation?: { latitude: number; longitude: number } | null;
  searchRadius?: number; // in km
  onClinicSelect?: (clinic: ClinicMapItem) => void;
  selectedClinicId?: string | null;
}

// Spain center coordinates
const SPAIN_CENTER: [number, number] = [40.4168, -3.7038];
const DEFAULT_ZOOM = 6;
const USER_ZOOM = 12;

// Custom marker icons
const createIcon = (color: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const redIcon = createIcon("#dc2626"); // 24h clinics
const orangeIcon = createIcon("#ea580c"); // Emergency clinics
const blueIcon = createIcon("#2563eb"); // User location

// Component to handle map center changes
function MapCenterHandler({
  center,
  zoom
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  return null;
}

// Component to handle selected clinic focus
function SelectedClinicHandler({
  clinic
}: {
  clinic: ClinicMapItem | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (clinic) {
      map.setView([clinic.latitude, clinic.longitude], 14);
    }
  }, [map, clinic]);

  return null;
}

export function ClinicMap({
  clinics,
  userLocation,
  searchRadius = 10,
  onClinicSelect,
  selectedClinicId,
}: ClinicMapProps) {
  const [mapReady, setMapReady] = useState(false);

  // Determine map center and zoom
  const center: [number, number] = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : SPAIN_CENTER;
  const zoom = userLocation ? USER_ZOOM : DEFAULT_ZOOM;

  // Find selected clinic
  const selectedClinic = selectedClinicId
    ? clinics.find(c => c.id === selectedClinicId) || null
    : null;

  // Fix Leaflet default icon issue in Next.js
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="w-full h-full z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapCenterHandler center={center} zoom={zoom} />

      {selectedClinic && (
        <SelectedClinicHandler clinic={selectedClinic} />
      )}

      {/* User location marker */}
      {userLocation && (
        <>
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={blueIcon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Tu ubicación</p>
              </div>
            </Popup>
          </Marker>

          {/* Search radius circle */}
          <Circle
            center={[userLocation.latitude, userLocation.longitude]}
            radius={searchRadius * 1000} // Convert km to meters
            pathOptions={{
              color: "#2563eb",
              fillColor: "#2563eb",
              fillOpacity: 0.1,
            }}
          />
        </>
      )}

      {/* Clinic markers */}
      {clinics.map((clinic) => (
        <Marker
          key={clinic.id}
          position={[clinic.latitude, clinic.longitude]}
          icon={clinic.is_24h ? redIcon : orangeIcon}
          eventHandlers={{
            click: () => onClinicSelect?.(clinic),
          }}
        >
          <Popup>
            <div className="min-w-[200px]">
              <h3 className="font-semibold text-base mb-1">{clinic.name}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {clinic.address}, {clinic.city}
              </p>
              {clinic.distance_km !== undefined && (
                <p className="text-sm text-gray-500 mb-2">
                  A {clinic.distance_km.toFixed(1)} km
                </p>
              )}
              <div className="flex gap-2">
                <a href={`tel:${clinic.phone}`} className="flex-1">
                  <Button size="sm" variant="emergency" className="w-full">
                    <Phone className="h-4 w-4 mr-1" />
                    Llamar
                  </Button>
                </a>
                <Link href={`/clinica/${clinic.slug}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">
                    Ver detalles
                  </Button>
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
