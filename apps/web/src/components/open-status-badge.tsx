"use client";

import { Badge } from "@petvia/ui";

interface OpenStatusBadgeProps {
  is24h: boolean;
  isOpen?: boolean;
  className?: string;
}

export function OpenStatusBadge({ is24h, isOpen, className }: OpenStatusBadgeProps) {
  // 24h clinics are always open
  if (is24h) {
    return (
      <Badge variant="emergency" className={className}>
        24h
      </Badge>
    );
  }

  // If we have open status
  if (isOpen !== undefined) {
    return isOpen ? (
      <Badge variant="open" className={className}>
        Abierto
      </Badge>
    ) : (
      <Badge variant="closed" className={className}>
        Cerrado
      </Badge>
    );
  }

  // No status available
  return null;
}
