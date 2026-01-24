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

// Search nearby clinics with default radius of 10km
export async function searchNearbyClinics(
  supabase: SupabaseClient<Database>,
  latitude: number,
  longitude: number,
  options?: {
    radiusKm?: number;
    emergencyOnly?: boolean;
  }
) {
  const radiusKm = options?.radiusKm ?? 10;
  const emergencyOnly = options?.emergencyOnly ?? false;

  return supabase.rpc("find_nearby_clinics", {
    lat: latitude,
    lng: longitude,
    radius_km: radiusKm,
    emergency_only: emergencyOnly,
  });
}

// Check if a clinic is currently open
export async function getClinicOpenStatus(
  supabase: SupabaseClient<Database>,
  clinicId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_clinic_open_now", {
    clinic_id: clinicId,
  });

  if (error) {
    console.error("Error checking clinic open status:", error);
    return false;
  }

  return data ?? false;
}

// Get open status for multiple clinics
export async function getClinicsOpenStatus(
  supabase: SupabaseClient<Database>,
  clinicIds: string[]
): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};

  // Batch check - in production you'd want a single RPC for this
  await Promise.all(
    clinicIds.map(async (id) => {
      results[id] = await getClinicOpenStatus(supabase, id);
    })
  );

  return results;
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
