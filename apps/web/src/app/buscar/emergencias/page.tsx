import { Suspense } from "react";
import { Skeleton } from "@petvia/ui";
import { EmergenciasClient } from "./client";

export const metadata = {
  title: "Urgencias Veterinarias 24h",
  description: "Encuentra clínicas veterinarias con servicio de urgencias 24 horas cerca de ti en España.",
};

function LoadingSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-50 w-full border-b bg-emergency-500 h-16" />
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        <div className="h-[40vh] lg:h-full lg:w-1/2 bg-muted animate-pulse" />
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function EmergenciasPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <EmergenciasClient />
    </Suspense>
  );
}
