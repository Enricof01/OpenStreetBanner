import { useEffect, useRef, useState } from "react";

type GeoState =
  | { status: "idle" | "loading"; coords?: undefined; error?: undefined }
  | { status: "ready"; coords: { lat: number; lng: number; accuracy?: number }; error?: undefined }
  | { status: "error"; coords?: undefined; error: string };

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: "idle" });
  const watchIdRef = useRef<number | null>(null);

  function startWatch() {
    if (!("geolocation" in navigator)) {
      setState({ status: "error", error: "Geolocation wird vom Browser nicht unterstützt." });
      return;
    }

    // Alten Watch stoppen falls einer läuft
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setState({ status: "loading" });

    watchIdRef.current = navigator.geolocation.watchPosition(
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

  useEffect(() => {
    startWatch();

    // Cleanup beim Unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // request() startet den Watch neu (z.B. nach einem Fehler)
  return { state, request: startWatch };
}