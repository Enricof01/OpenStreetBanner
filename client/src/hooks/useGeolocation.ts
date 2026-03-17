import { useEffect, useState } from "react";

type GeoState =
  | { status: "idle" | "loading"; coords?: undefined; error?: undefined }
  | { status: "ready"; coords: { lat: number; lng: number; accuracy?: number }; error?: undefined }
  | { status: "error"; coords?: undefined; error: string };

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: "idle" });

  async function request() {
    if (!("geolocation" in navigator)) {
      setState({ status: "error", error: "Geolocation wird vom Browser nicht unterstützt." });
      return;
    }

    setState({ status: "loading" });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: "ready",
          coords: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          },
        });
      },
      (err) => {
        let msg = "Standort konnte nicht ermittelt werden.";
        if (err.code === err.PERMISSION_DENIED) msg = "Standortzugriff wurde verweigert.";
        if (err.code === err.POSITION_UNAVAILABLE) msg = "Standort nicht verfügbar.";
        if (err.code === err.TIMEOUT) msg = "Standortabfrage timed out.";
        setState({ status: "error", error: msg });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  // optional: direkt beim Laden anfragen
  useEffect(() => {
    request();
  }, []);

  return { state, request };
}