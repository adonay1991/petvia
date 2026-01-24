import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@petvia/ui";
import { Clock, MapPin, Stethoscope, Euro, Phone, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-petvia-600">PetVia</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/buscar/emergencias" className="text-foreground/60 hover:text-foreground transition-colors">
              Urgencias 24h
            </Link>
            <Link href="/buscar/especialistas" className="text-foreground/60 hover:text-foreground transition-colors">
              Especialistas
            </Link>
            <Link href="/buscar/precios" className="text-foreground/60 hover:text-foreground transition-colors">
              Comparar precios
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Iniciar sesión</Button>
            </Link>
            <Link href="/registro">
              <Button size="sm">Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-4">
                Nuevo en España
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Encuentra el mejor{" "}
                <span className="text-petvia-600">veterinario</span> para tu mascota
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Urgencias 24h, especialistas certificados AVEPA y comparador de precios.
                Todo lo que necesitas para cuidar de tu mascota en un solo lugar.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/buscar/emergencias">
                  <Button variant="emergency" size="lg" className="w-full sm:w-auto">
                    <Phone className="mr-2 h-5 w-5" />
                    Urgencias 24h
                  </Button>
                </Link>
                <Link href="/buscar/especialistas">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Stethoscope className="mr-2 h-5 w-5" />
                    Buscar especialista
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">
                Todo lo que necesitas
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Herramientas diseñadas para ayudarte a encontrar la mejor atención veterinaria
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-emergency-100 flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-emergency-600" />
                  </div>
                  <CardTitle>Urgencias 24h</CardTitle>
                  <CardDescription>
                    Encuentra clínicas con servicio de urgencias abiertas ahora mismo cerca de ti
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/buscar/emergencias" className="inline-flex items-center text-petvia-600 hover:underline">
                    Ver urgencias <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-petvia-100 flex items-center justify-center mb-4">
                    <Stethoscope className="h-6 w-6 text-petvia-600" />
                  </div>
                  <CardTitle>Especialistas AVEPA</CardTitle>
                  <CardDescription>
                    Directorio de especialistas certificados en cardiología, dermatología, oncología y más
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/buscar/especialistas" className="inline-flex items-center text-petvia-600 hover:underline">
                    Ver especialistas <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-success-100 flex items-center justify-center mb-4">
                    <Euro className="h-6 w-6 text-success-600" />
                  </div>
                  <CardTitle>Comparador de precios</CardTitle>
                  <CardDescription>
                    Compara precios de vacunas, cirugías y otros servicios veterinarios en tu zona
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/buscar/precios" className="inline-flex items-center text-petvia-600 hover:underline">
                    Comparar precios <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                ¿Tienes una clínica veterinaria?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Únete a PetVia y conecta con miles de dueños de mascotas que buscan servicios veterinarios de calidad.
              </p>
              <div className="mt-8">
                <Link href="/para-clinicas">
                  <Button size="lg">
                    Registrar mi clínica
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <span className="text-xl font-bold text-petvia-600">PetVia</span>
              <p className="mt-4 text-sm text-muted-foreground">
                Encuentra el mejor veterinario para tu mascota en España.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Buscar</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/buscar/emergencias" className="hover:text-foreground">Urgencias 24h</Link></li>
                <li><Link href="/buscar/especialistas" className="hover:text-foreground">Especialistas</Link></li>
                <li><Link href="/buscar/precios" className="hover:text-foreground">Comparar precios</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Para clínicas</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/para-clinicas" className="hover:text-foreground">Registrar clínica</Link></li>
                <li><Link href="/planes" className="hover:text-foreground">Planes y precios</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacidad" className="hover:text-foreground">Privacidad</Link></li>
                <li><Link href="/terminos" className="hover:text-foreground">Términos de uso</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} PetVia. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
