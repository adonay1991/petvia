import { Suspense } from "react";
import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Skeleton, Input } from "@petvia/ui";
import { Euro, ArrowLeft, Search, MapPin } from "lucide-react";

export const metadata = {
  title: "Comparador de Precios Veterinarios",
  description: "Compara precios de servicios veterinarios en tu zona. Vacunas, cirugías, consultas y más.",
};

// Common veterinary services for comparison
const COMMON_SERVICES = [
  { name: "Consulta general", category: "consultas", avgPrice: "30-50" },
  { name: "Vacuna polivalente perro", category: "vacunas", avgPrice: "40-60" },
  { name: "Vacuna rabia", category: "vacunas", avgPrice: "25-35" },
  { name: "Vacuna triple felina", category: "vacunas", avgPrice: "35-50" },
  { name: "Castración perro macho", category: "cirugía", avgPrice: "150-250" },
  { name: "Castración perro hembra", category: "cirugía", avgPrice: "200-350" },
  { name: "Castración gato macho", category: "cirugía", avgPrice: "80-120" },
  { name: "Castración gato hembra", category: "cirugía", avgPrice: "120-180" },
  { name: "Limpieza dental", category: "odontología", avgPrice: "100-200" },
  { name: "Análisis de sangre completo", category: "diagnóstico", avgPrice: "60-100" },
  { name: "Radiografía", category: "diagnóstico", avgPrice: "50-80" },
  { name: "Ecografía", category: "diagnóstico", avgPrice: "60-100" },
  { name: "Microchip", category: "identificación", avgPrice: "30-50" },
];

const SERVICE_CATEGORIES = [
  { id: "consultas", name: "Consultas" },
  { id: "vacunas", name: "Vacunas" },
  { id: "cirugía", name: "Cirugía" },
  { id: "odontología", name: "Odontología" },
  { id: "diagnóstico", name: "Diagnóstico" },
  { id: "identificación", name: "Identificación" },
];

function ServicesList({ category, search }: { category?: string; search?: string }) {
  let filteredServices = COMMON_SERVICES;

  if (category) {
    filteredServices = filteredServices.filter((s) => s.category === category);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredServices = filteredServices.filter((s) =>
      s.name.toLowerCase().includes(searchLower)
    );
  }

  if (filteredServices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontraron servicios.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Intenta con otro término de búsqueda o categoría.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredServices.map((service) => (
        <Card key={service.name} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <Badge variant="outline" className="w-fit mb-2">
              {SERVICE_CATEGORIES.find((c) => c.id === service.category)?.name}
            </Badge>
            <CardTitle className="text-lg">{service.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-petvia-600">
                {service.avgPrice}€
              </span>
              <span className="text-sm text-muted-foreground">precio medio</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Basado en precios de clínicas en España
            </p>
            <Button variant="outline" size="sm" className="w-full mt-4">
              Ver clínicas con este servicio
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function PreciosPage(props: {
  searchParams: Promise<{ categoria?: string; q?: string }>;
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
            <Euro className="h-5 w-5 text-success-600" />
            <span className="font-semibold">Comparador</span>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Comparador de Precios</h1>
          <p className="mt-2 text-muted-foreground">
            Compara precios de servicios veterinarios en tu zona
          </p>
        </div>

        {/* Search and Location */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar servicio..."
              className="pl-9"
              defaultValue={searchParams.q}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <MapPin className="h-4 w-4" />
            Madrid
          </Button>
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            Categorías
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/buscar/precios">
              <Badge
                variant={!searchParams.categoria ? "default" : "outline"}
                className="cursor-pointer"
              >
                Todos
              </Badge>
            </Link>
            {SERVICE_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/buscar/precios?categoria=${cat.id}`}
              >
                <Badge
                  variant={searchParams.categoria === cat.id ? "default" : "outline"}
                  className="cursor-pointer"
                >
                  {cat.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-8 rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Nota:</strong> Los precios mostrados son orientativos y pueden variar según la clínica,
            el peso del animal y otros factores. Contacta con la clínica para obtener un presupuesto exacto.
          </p>
        </div>

        {/* Results */}
        <Suspense fallback={<div>Cargando...</div>}>
          <ServicesList category={searchParams.categoria} search={searchParams.q} />
        </Suspense>

        {/* CTA for clinics */}
        <div className="mt-12 text-center">
          <Card className="inline-block max-w-lg">
            <CardHeader>
              <CardTitle>¿Tienes una clínica veterinaria?</CardTitle>
              <CardDescription>
                Publica tus precios y servicios para que los dueños de mascotas puedan encontrarte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/para-clinicas">
                <Button>Registrar mi clínica</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
