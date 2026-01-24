import { Suspense } from "react";
import Link from "next/link";
import { createServerClient } from "@petvia/db/server";
import { getSpecialists, AVEPA_SPECIALTIES } from "@petvia/db";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Skeleton } from "@petvia/ui";
import { Stethoscope, ArrowLeft, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Especialistas Veterinarios AVEPA",
  description: "Directorio de especialistas veterinarios certificados AVEPA en España. Cardiología, dermatología, oncología y más.",
};

async function SpecialistsList({ specialty }: { specialty?: string }) {
  const supabase = await createServerClient();
  const { data: specialists, error } = await getSpecialists(supabase, {
    specialty,
    verifiedOnly: false,
    limit: 20,
  });

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Error al cargar los especialistas. Intenta de nuevo.</p>
      </div>
    );
  }

  if (!specialists || specialists.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontraron especialistas.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Intenta con otra especialidad o elimina los filtros.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {specialists.map((specialist) => (
        <Card key={specialist.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{specialist.name}</CardTitle>
                  {specialist.is_verified && (
                    <CheckCircle className="h-4 w-4 text-success-500" />
                  )}
                </div>
                {specialist.title && (
                  <CardDescription className="mt-1">
                    {specialist.title}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {specialist.avepa_specialties?.map((spec) => (
                <Badge key={spec} variant="secondary">
                  {spec}
                </Badge>
              ))}
            </div>
            {specialist.years_experience && (
              <p className="text-sm text-muted-foreground mb-4">
                {specialist.years_experience} años de experiencia
              </p>
            )}
            <Link href={`/especialista/${specialist.slug}`}>
              <Button variant="outline" size="sm" className="w-full">
                Ver perfil completo
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SpecialistsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function EspecialistasPage(props: {
  searchParams: Promise<{ especialidad?: string }>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-petvia-600 hover:opacity-80">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">PetVia</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-petvia-600" />
            <span className="font-semibold">Especialistas</span>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Especialistas Veterinarios</h1>
          <p className="mt-2 text-muted-foreground">
            Directorio de especialistas certificados AVEPA en España
          </p>
        </div>

        {/* Specialty Filters */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            Filtrar por especialidad
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/buscar/especialistas">
              <Badge
                variant={!searchParams.especialidad ? "default" : "outline"}
                className="cursor-pointer"
              >
                Todas
              </Badge>
            </Link>
            {AVEPA_SPECIALTIES.map((spec) => (
              <Link
                key={spec}
                href={`/buscar/especialistas?especialidad=${encodeURIComponent(spec)}`}
              >
                <Badge
                  variant={searchParams.especialidad === spec ? "default" : "outline"}
                  className="cursor-pointer"
                >
                  {spec}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* Results */}
        <Suspense fallback={<SpecialistsSkeleton />}>
          <SpecialistsList specialty={searchParams.especialidad} />
        </Suspense>
      </main>
    </div>
  );
}
