import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Polyline, useMap } from "react-leaflet";

type TripResp = {
  distance: number;
  duration: number;
  geometry: {
    type: "LineString";
    coordinates: [number, number][]; // [lon,lat]
  };
};

export default function OsrmTripLayer({tripIds, newRouteCount, setLoading} : {tripIds: number[]; newRouteCount: number; setLoading: (arg: boolean) => void}) {
  const map = useMap();
  const [trip, setTrip] = useState<TripResp | null>(null);
  const [error, setError] = useState<string | null>(null);


  async function loadTrip() {
    setError(null);
    try {
      setLoading(true)
      const { data } = await axios.post<TripResp>(
        `/api/osrm/trip`, {array: tripIds}
      );
      console.log("OSRM API response:", data);

      setTrip(data);
    } catch (e: any) {
      setError(e?.message ?? "OSRM Trip konnte nicht geladen werden");
      setTrip(null);
    }
    finally{
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newRouteCount]);

const positions = useMemo<[number, number][]>(() => {
  if (!trip) return [];

  return trip.geometry.coordinates.map(
    ([lon, lat]) => [lat, lon]
  );
}, [trip]);

  useEffect(() => {
    if (!positions || positions.length < 2) return;
    // Karte auf Route zoomen
    map.fitBounds(positions, { padding: [30, 30] });
  }, [positions, map]);

  if (error) {
    // Kein fancy UI, nur console + nix rendern
    console.error(error);
    return null;
  }

  if (!positions) return null;

  return <Polyline positions={positions} />;
}