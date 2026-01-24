import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "../types";

export type Specialist = Tables<"specialists">;

// AVEPA recognized specialties in Spain
export const AVEPA_SPECIALTIES = [
  "Anestesiología y Analgesia",
  "Cardiología",
  "Cirugía",
  "Comportamiento Animal",
  "Dermatología",
  "Diagnóstico por Imagen",
  "Endocrinología",
  "Medicina Felina",
  "Medicina Interna",
  "Medicina Zoológica",
  "Neurología",
  "Nutrición",
  "Odontología",
  "Oftalmología",
  "Oncología",
  "Reproducción",
  "Traumatología y Ortopedia",
] as const;

export type AvepaSpecialty = (typeof AVEPA_SPECIALTIES)[number];

export async function getSpecialists(
  supabase: SupabaseClient<Database>,
  options?: {
    limit?: number;
    offset?: number;
    specialty?: string;
    verifiedOnly?: boolean;
  }
) {
  let query = supabase.from("specialists").select("*");

  if (options?.specialty) {
    query = query.contains("avepa_specialties", [options.specialty]);
  }

  if (options?.verifiedOnly) {
    query = query.eq("is_verified", true);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  query = query.order("name");

  return query;
}

export async function getSpecialistBySlug(
  supabase: SupabaseClient<Database>,
  slug: string
) {
  return supabase
    .from("specialists")
    .select(
      `
      *,
      clinic_specialists (
        *,
        clinics (*)
      )
    `
    )
    .eq("slug", slug)
    .single();
}

export async function getSpecialistsByClinic(
  supabase: SupabaseClient<Database>,
  clinicId: string
) {
  return supabase
    .from("clinic_specialists")
    .select(
      `
      *,
      specialists (*)
    `
    )
    .eq("clinic_id", clinicId);
}

export async function searchSpecialists(
  supabase: SupabaseClient<Database>,
  searchTerm: string,
  options?: {
    limit?: number;
    specialty?: string;
  }
) {
  let query = supabase
    .from("specialists")
    .select("*")
    .ilike("name", `%${searchTerm}%`);

  if (options?.specialty) {
    query = query.contains("avepa_specialties", [options.specialty]);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  return query;
}
