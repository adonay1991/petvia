"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@petvia/ui";
import { MapPin, Phone } from "lucide-react";
import { OpenStatusBadge } from "./open-status-badge";

export interface ClinicCardData {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  is_24h: boolean;
  has_emergency: boolean;
  distance_km?: number;
  isOpen?: boolean;
}

interface ClinicCardProps {
  clinic: ClinicCardData;
  onSelect?: () => void;
  isSelected?: boolean;
}

export function ClinicCard({ clinic, onSelect, isSelected }: ClinicCardProps) {
  return (
    <Card
      className={`hover:shadow-md transition-shadow cursor-pointer ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{clinic.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{clinic.address}, {clinic.city}</span>
            </CardDescription>
            {clinic.distance_km !== undefined && (
              <p className="text-sm text-muted-foreground mt-1">
                A {clinic.distance_km.toFixed(1)} km
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1 ml-2">
            <OpenStatusBadge
              is24h={clinic.is_24h}
              isOpen={clinic.isOpen}
            />
            {clinic.has_emergency && !clinic.is_24h && (
              <span className="text-xs text-emergency-600 font-medium">
                Urgencias
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-2">
          <a
            href={`tel:${clinic.phone}`}
            className="flex items-center gap-2 text-lg font-semibold text-petvia-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="h-5 w-5" />
            {clinic.phone}
          </a>
          <Link href={`/clinica/${clinic.slug}`} onClick={(e) => e.stopPropagation()}>
            <Button variant="outline" size="sm">
              Ver detalles
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
