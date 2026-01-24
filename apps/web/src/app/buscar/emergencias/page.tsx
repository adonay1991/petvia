import { Suspense } from "react";
import Link from "next/link";
import { createServerClient } from "@petvia/db/server";
import { getEmergencyClinics } from "@petvia/db";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Skeleton } from "@petvia/ui";
import { Clock, MapPin, Phone, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Urgencias Veterinarias 24h",
  description: "Encuentra clínicas veterinarias con servicio de urgencias 24 horas cerca de ti en España.",
};

async function EmergencyClinicsList({ city, province }: { city?: string; province?: string }) {
  const supabase = await createServerClient();
  const { data: clinics, error } = await getEmergencyClinics(supabase, {
    city,
    province,
    limit: 20,
  });

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Error al cargar las clínicas. Intenta de nuevo.</p>
      </div>
    );
  }

  if (!clinics || clinics.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontraron clínicas de urgencias en esta zona.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Intenta ampliar tu búsqueda o contacta al 112 para emergencias.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {clinics.map((clinic) => (
        <Card key={clinic.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{clinic.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" />
                  {clinic.address}, {clinic.city}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {clinic.is_24h && (
                  <Badge variant="emergency">24h</Badge>
                )}
                {clinic.has_emergency && !clinic.is_24h && (
                  <Badge variant="destructive">Urgencias</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <a
                href={`tel:${clinic.phone}`}
                className="flex items-center gap-2 text-lg font-semibold text-petvia-600 hover:underline"
              >
                <Phone className="h-5 w-5" />
                {clinic.phone}
              </a>
              <Link href={`/clinica/${clinic.slug}`}>
                <Button variant="outline" size="sm">
                  Ver detalles
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ClinicsSkeleton() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function EmergenciasPage(props: {
  searchParams: Promise<{ city?: string; province?: string }>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="min-h-screen">
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

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Urgencias Veterinarias 24h</h1>
          <p className="mt-2 text-muted-foreground">
            Clínicas con servicio de urgencias disponibles ahora
          </p>
        </div>

        {/* Emergency Alert */}
        <div className="mb-8 rounded-lg bg-emergency-50 border border-emergency-200 p-4">
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-emergency-600 mt-0.5" />
            <div>
              <p className="font-semibold text-emergency-800">
                ¿Es una emergencia crítica?
              </p>
              <p className="text-sm text-emergency-700 mt-1">
                Si tu mascota tiene dificultad para respirar, está inconsciente, o tiene hemorragia severa,
                llama inmediatamente al veterinario más cercano.
              </p>
            </div>
          </div>
        </div>

        {/* Filters - TODO: Add city/province selectors */}
        <div className="mb-6 flex flex-wrap gap-4">
          <Button variant="outline" size="sm" className="gap-2">
            <MapPin className="h-4 w-4" />
            Usar mi ubicación
          </Button>
        </div>

        {/* Results */}
        <Suspense fallback={<ClinicsSkeleton />}>
          <EmergencyClinicsList city={searchParams.city} province={searchParams.province} />
        </Suspense>
      </main>
    </div>
  );
}
