"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button, Badge, Skeleton } from "@petvia/ui";
import { Clock, ArrowLeft, MapPin, Phone, List, Map as MapIcon, Loader2 } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";
import { useGeolocation } from "@/hooks/use-geolocation";
import { ClinicCard, type ClinicCardData } from "@/components/clinic-card";
import type { ClinicMapItem } from "@/components/clinic-map";

// Dynamic import for map (Leaflet doesn't support SSR)
const ClinicMap = dynamic(
  () => import("@/components/clinic-map").then((mod) => mod.ClinicMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

interface ClinicWithDistance {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  is_24h: boolean;
  has_emergency: boolean;
  distance_km: number;
  latitude?: number;
  longitude?: number;
}

export function EmergenciasClient() {
  const [clinics, setClinics] = useState<ClinicWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [showOnlyH24, setShowOnlyH24] = useState(false);
  const [mobileView, setMobileView] = useState<"map" | "list">("list");

  const {
    latitude,
    longitude,
    error: geoError,
    loading: geoLoading,
    requestLocation,
    isSupported,
  } = useGeolocation();

  const hasLocation = latitude !== null && longitude !== null;

  // Fetch clinics
  const fetchClinics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserClient();

      if (hasLocation) {
        // Search nearby with PostGIS
        const { data, error: fetchError } = await supabase.rpc("find_nearby_clinics", {
          lat: latitude!,
          lng: longitude!,
          radius_km: 50, // 50km radius for emergencies
          emergency_only: true,
        });

        if (fetchError) throw fetchError;

        // The RPC doesn't return lat/lng, we need to add them for the map
        // For now, we'll fetch the full clinic data to get locations
        if (data && data.length > 0) {
          const clinicIds = data.map((c: { id: string }) => c.id);
          const { data: fullClinics } = await supabase
            .from("clinics")
            .select("id, location")
            .in("id", clinicIds);

          // Note: PostGIS geography type needs special handling
          // For demo, we'll use approximate coordinates from seed data
          const clinicsWithCoords = data.map((clinic: ClinicWithDistance) => ({
            ...clinic,
            // Placeholder coords - in production these would come from the DB
            latitude: 40.4168 + (Math.random() - 0.5) * 0.2,
            longitude: -3.7038 + (Math.random() - 0.5) * 0.2,
          }));

          setClinics(clinicsWithCoords);
        } else {
          setClinics([]);
        }
      } else {
        // No location - fetch all emergency clinics
        const { data, error: fetchError } = await supabase
          .from("clinics")
          .select("*")
          .or("has_emergency.eq.true,is_24h.eq.true")
          .order("is_24h", { ascending: false })
          .limit(50);

        if (fetchError) throw fetchError;

        // Add placeholder coordinates for demo
        const clinicsWithCoords = (data || []).map((clinic) => ({
          id: clinic.id,
          name: clinic.name,
          slug: clinic.slug,
          address: clinic.address,
          city: clinic.city,
          phone: clinic.phone,
          is_24h: clinic.is_24h,
          has_emergency: clinic.has_emergency,
          distance_km: 0,
          latitude: 40.4168 + (Math.random() - 0.5) * 0.3,
          longitude: -3.7038 + (Math.random() - 0.5) * 0.3,
        }));

        setClinics(clinicsWithCoords);
      }
    } catch (err) {
      console.error("Error fetching clinics:", err);
      setError("Error al cargar las clínicas. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [hasLocation, latitude, longitude]);

  // Initial fetch
  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchClinics();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [fetchClinics]);

  // Filter clinics
  const filteredClinics = showOnlyH24
    ? clinics.filter((c) => c.is_24h)
    : clinics;

  // Convert to map items
  const mapClinics: ClinicMapItem[] = filteredClinics
    .filter((c) => c.latitude && c.longitude)
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      address: c.address,
      city: c.city,
      phone: c.phone,
      is_24h: c.is_24h,
      has_emergency: c.has_emergency,
      latitude: c.latitude!,
      longitude: c.longitude!,
      distance_km: c.distance_km,
    }));

  // Convert to card data
  const cardClinics: ClinicCardData[] = filteredClinics.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    address: c.address,
    city: c.city,
    phone: c.phone,
    is_24h: c.is_24h,
    has_emergency: c.has_emergency,
    distance_km: hasLocation ? c.distance_km : undefined,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-emergency-500 text-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">PetVia</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span className="font-semibold">Urgencias 24h</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Map - Left side on desktop, toggle on mobile */}
        <div
          className={`${
            mobileView === "map" ? "h-[60vh]" : "h-[40vh]"
          } lg:h-[calc(100vh-4rem)] lg:w-1/2 lg:sticky lg:top-16 ${
            mobileView === "list" ? "hidden lg:block" : ""
          }`}
        >
          <ClinicMap
            clinics={mapClinics}
            userLocation={hasLocation ? { latitude: latitude!, longitude: longitude! } : null}
            searchRadius={50}
            selectedClinicId={selectedClinicId}
            onClinicSelect={(clinic) => setSelectedClinicId(clinic.id)}
          />
        </div>

        {/* List - Right side on desktop */}
        <div
          className={`flex-1 overflow-auto ${
            mobileView === "map" ? "hidden lg:block" : ""
          }`}
        >
          <div className="p-4 space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex gap-2">
                {/* Geolocation button */}
                {isSupported && (
                  <Button
                    variant={hasLocation ? "default" : "outline"}
                    size="sm"
                    onClick={requestLocation}
                    disabled={geoLoading}
                  >
                    {geoLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <MapPin className="h-4 w-4 mr-2" />
                    )}
                    {hasLocation ? "Ubicación activa" : "Usar mi ubicación"}
                  </Button>
                )}

                {/* Filter toggle */}
                <Button
                  variant={showOnlyH24 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowOnlyH24(!showOnlyH24)}
                >
                  Solo 24h
                </Button>
              </div>

              {/* Mobile view toggle */}
              <div className="lg:hidden flex gap-1">
                <Button
                  variant={mobileView === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMobileView("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={mobileView === "map" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMobileView("map")}
                >
                  <MapIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Geolocation error */}
            {geoError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive">{geoError}</p>
              </div>
            )}

            {/* Emergency alert */}
            <div className="rounded-lg bg-emergency-50 border border-emergency-200 p-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-emergency-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-emergency-800">
                    ¿Es una emergencia crítica?
                  </p>
                  <p className="text-sm text-emergency-700 mt-1">
                    Si tu mascota tiene dificultad para respirar, está inconsciente o tiene
                    hemorragia severa, llama inmediatamente al veterinario más cercano.
                  </p>
                </div>
              </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredClinics.length} clínica{filteredClinics.length !== 1 ? "s" : ""} encontrada
                {filteredClinics.length !== 1 ? "s" : ""}
                {hasLocation && " cerca de ti"}
              </p>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border p-4">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64 mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="text-center py-8">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={fetchClinics}>Reintentar</Button>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && filteredClinics.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No se encontraron clínicas de urgencias.</p>
                {showOnlyH24 && (
                  <Button
                    variant="link"
                    onClick={() => setShowOnlyH24(false)}
                    className="mt-2"
                  >
                    Ver todas las urgencias
                  </Button>
                )}
              </div>
            )}

            {/* Clinic list */}
            {!loading && !error && filteredClinics.length > 0 && (
              <div className="space-y-3">
                {cardClinics.map((clinic) => (
                  <ClinicCard
                    key={clinic.id}
                    clinic={clinic}
                    isSelected={selectedClinicId === clinic.id}
                    onSelect={() => setSelectedClinicId(clinic.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
