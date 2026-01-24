"use client";

import { useState, useCallback } from "react";

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export interface UseGeolocationReturn extends GeolocationState {
  requestLocation: () => void;
  isSupported: boolean;
}

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000, // 5 minutes cache
};

export function useGeolocation(): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  });

  const isSupported = typeof navigator !== "undefined" && "geolocation" in navigator;

  const requestLocation = useCallback(() => {
    if (!isSupported) {
      setState((prev) => ({
        ...prev,
        error: "Tu navegador no soporta geolocalización",
        loading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (error) => {
        let errorMessage: string;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permiso de ubicación denegado. Actívalo en la configuración del navegador.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "No se pudo obtener tu ubicación. Inténtalo de nuevo.";
            break;
          case error.TIMEOUT:
            errorMessage = "Tiempo de espera agotado. Inténtalo de nuevo.";
            break;
          default:
            errorMessage = "Error al obtener ubicación. Inténtalo de nuevo.";
        }

        setState({
          latitude: null,
          longitude: null,
          error: errorMessage,
          loading: false,
        });
      },
      GEOLOCATION_OPTIONS
    );
  }, [isSupported]);

  return {
    ...state,
    requestLocation,
    isSupported,
  };
}
