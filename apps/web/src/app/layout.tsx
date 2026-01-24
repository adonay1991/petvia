import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "PetVia - Encuentra veterinarios en España",
    template: "%s | PetVia",
  },
  description:
    "Busca veterinarios de urgencias 24h, especialistas certificados AVEPA y compara precios de servicios veterinarios en toda España.",
  keywords: [
    "veterinario",
    "urgencias veterinarias",
    "veterinario 24 horas",
    "especialista veterinario",
    "AVEPA",
    "clínica veterinaria",
    "España",
  ],
  authors: [{ name: "PetVia" }],
  creator: "PetVia",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://petvia.es",
    title: "PetVia - Encuentra veterinarios en España",
    description:
      "Busca veterinarios de urgencias 24h, especialistas certificados AVEPA y compara precios de servicios veterinarios en toda España.",
    siteName: "PetVia",
  },
  twitter: {
    card: "summary_large_image",
    title: "PetVia - Encuentra veterinarios en España",
    description:
      "Busca veterinarios de urgencias 24h, especialistas certificados AVEPA y compara precios de servicios veterinarios en toda España.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
