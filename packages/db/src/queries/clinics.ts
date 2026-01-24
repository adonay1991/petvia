import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "../types";

export type Clinic = Tables<"clinics">;

export async function getClinics(
  supabase: SupabaseClient<Database>,
  options?: {
    limit?: number;
    offset?: number;
    city?: string;
    province?: string;
    emergencyOnly?: boolean;
    is24h?: boolean;
  }
) {
  let query = supabase.from("clinics").select("*");

  if (options?.city) {
    query = query.eq("city", options.city);
  }

  if (options?.province) {
    query = query.eq("province", options.province);
  }

  if (options?.emergencyOnly) {
    query = query.eq("has_emergency", true);
  }

  if (options?.is24h) {
    query = query.eq("is_24h", true);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  query = query.order("rating_average", { ascending: false });

  return query;
}

export async function getClinicBySlug(
  supabase: SupabaseClient<Database>,
  slug: string
) {
  return supabase
    .from("clinics")
    .select(
      `
      *,
      clinic_opening_hours (*),
      clinic_specialists (
        *,
        specialists (*)
      ),
      clinic_services (
        *,
        services (*)
      )
    `
    )
    .eq("slug", slug)
    .single();
}

export async function findNearbyClinics(
  supabase: SupabaseClient<Database>,
  lat: number,
  lng: number,
  radiusKm: number = 10,
  emergencyOnly: boolean = false
) {
  return supabase.rpc("find_nearby_clinics", {
    lat,
    lng,
    radius_km: radiusKm,
    emergency_only: emergencyOnly,
  });
}

export async function getEmergencyClinics(
  supabase: SupabaseClient<Database>,
  options?: {
    city?: string;
    province?: string;
    limit?: number;
  }
) {
  let query = supabase
    .from("clinics")
    .select("*")
    .or("has_emergency.eq.true,is_24h.eq.true");

  if (options?.city) {
    query = query.eq("city", options.city);
  }

  if (options?.province) {
    query = query.eq("province", options.province);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  query = query.order("is_24h", { ascending: false });

  return query;
}
