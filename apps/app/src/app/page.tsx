import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@petvia/ui";

export default function DashboardHomePage() {
  return (
    <div className="min-h-screen">
      {/* Sidebar placeholder */}
      <div className="flex">
        <aside className="w-64 min-h-screen border-r bg-card p-4">
          <div className="mb-8">
            <span className="text-xl font-bold text-petvia-600">PetVia</span>
            <span className="text-xs text-muted-foreground block">Dashboard</span>
          </div>
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-md bg-primary/10 text-primary font-medium"
            >
              Inicio
            </Link>
            <Link
              href="/clinica"
              className="block px-3 py-2 rounded-md text-muted-foreground hover:bg-muted"
            >
              Mi Clínica
            </Link>
            <Link
              href="/servicios"
              className="block px-3 py-2 rounded-md text-muted-foreground hover:bg-muted"
            >
              Servicios y Precios
            </Link>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-8">Bienvenido a PetVia Dashboard</h1>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Mi Clínica</CardTitle>
                <CardDescription>
                  Gestiona la información de tu clínica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/clinica">
                  <Button variant="outline" className="w-full">
                    Editar información
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Servicios</CardTitle>
                <CardDescription>
                  Actualiza tus servicios y precios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/servicios">
                  <Button variant="outline" className="w-full">
                    Gestionar servicios
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
                <CardDescription>
                  Visualizaciones de tu clínica en PetVia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">visitas este mes</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">
              <strong>Nota:</strong> Esta es una versión de desarrollo del dashboard.
              Más funcionalidades estarán disponibles próximamente.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
