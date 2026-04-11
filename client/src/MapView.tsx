import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
// import { marker, type LatLngTuple } from "leaflet";
import OsrmTripLayer from "./TripLayer";
import MarkerEditDialog from "./MarkerEditDialog";
import { type MarkerDraft } from "./MarkerEditForm";
import LoadingOverlay from "./LoadingOverlay";

import { HQIcon, myLocationIcon, normalIcon, selectedIcon } from "./icons/icons"

type Location = {
  id: string;
  lat: number;
  lng: number;
  name: string;
  status: "HUEPFBURGEN" | "EISLAUF" | "IN_TOUR" | "ERLEDIGT";
  createdAt: number;
  Message: string;
};

async function newLoc(location: Coordinates) {
  await axios.post("/api/new", { name: "test", lat: location.lat, lng: location.lng });
}

type Coordinates = {
  lat: number;
  lng: number;
}

function ClickLogger({condition, getLocations} : {condition:boolean; getLocations: () => void} ) {
  if (condition) {

        useMapEvents({


          click(e) {
      console.log("Clicked:", e.latlng.lat, e.latlng.lng);
      const coord: Coordinates = { lat: e.latlng.lat, lng: e.latlng.lng };
      newLoc(coord);
      getLocations();
      console.log("neuer standort hinzugefügt");
      
    },


  });
  }

  return null;
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], Math.max(map.getZoom(), 16), { animate: true });
  }, [lat, lng, map]);
  return null;
}



export default function MapOnly({ loading, setLoading, myPos, routeOption, selectedNodes, setSelectedNodes, newRouteCount, newNodeCheck }: {


  myPos?: { lat: number; lng: number; accuracy?: number };
  routeOption: Boolean;
  selectedNodes: number[];
  setSelectedNodes: React.Dispatch<React.SetStateAction<number[]>>;
  newRouteCount: number;
  newNodeCheck: boolean;
  loading: boolean;
  setLoading: (arg: boolean) => void;

}) {
  const [locations, setLocations] = useState<Location[]>([]);
  // const [selectedMarker, setSelectedMarker] = useState<Location | null>(null);
  const [editing, setEditing] = useState<Location | null>(null);

  const dialogValue: MarkerDraft = {
    name: editing?.name ?? "",
    message: editing?.Message ?? "",
    status: (editing?.status as any) ?? "HUEPFBURGEN",
  };
  // const [filter, setFilter] = useState<"all" | Location["status"]>("all");
  // const [selectedNodes, setSelectedNodes] = useState<number[]>([]);

  async function getLocations() {
    const res = await axios.get("/api/getlocs");
    setLocations(res.data);
  }



  function onMarkerClick(id: number) {

    if (routeOption) {
      setSelectedNodes((prev) => {
        if (prev.includes(id)) {
          return prev.filter((x) => x !== id);
        }
        return [...prev, id];
      });
    }

    else {

      const loc = locations.find((l) => Number(l.id) == id)!
      setEditing(loc)
    }
  }





  useEffect(() => {

    getLocations();

  }, [])

  useEffect(() => {

    getLocations();

  }, [editing, newNodeCheck])


  const display = (
    locations.map((loc) => {
      const con = selectedNodes.find((s) => s == Number(loc.id))
      return (

        <Marker icon={con ? selectedIcon : normalIcon} key={loc.id} draggable={false} title="FS" position={[loc.lat, loc.lng]}
          eventHandlers={{
            click: () => onMarkerClick(Number(loc.id)),
          }}
        />



      )
    })

  )







  return (

    <>

    {loading && (
      <LoadingOverlay loading = {loading}/>
    )}

      <div style={{ height: "100vh" }}>
        <MapContainer center={[48.5, 9.2]} zoom={14} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />



          <Marker icon={HQIcon} draggable={false} title="FS" position={[48.50338, 9.204515]}> </Marker>
          {display}
          {/* <div style={{height: "100vh", width: "50vh", backgroundColor: "blue", zIndex: "20"}}>

              </div> */}
          <ClickLogger condition = {newNodeCheck} getLocations={getLocations} />

          {myPos && (
            <>
              <Recenter lat={myPos.lat} lng={myPos.lng} />
              <Marker icon={myLocationIcon} position={[myPos.lat, myPos.lng]}>
                <Popup>
                  <b>Du bist hier</b>
                  {myPos.accuracy ? <div>Genauigkeit: ~{Math.round(myPos.accuracy)}m</div> : null}
                </Popup>
              </Marker>

            </>
          )}
          <OsrmTripLayer setLoading = {setLoading}tripIds={selectedNodes} newRouteCount={newRouteCount} />

          <MarkerEditDialog
            open={!!editing}
            onClose={() => setEditing(null)}
            value={dialogValue}
            loading={loading}
            onSave={async (draft) => {
              if (!editing) return;
              setLoading(true);
              try {
                const { data } = await axios.patch(`/api/locations/${editing.id}`, draft);
                // optional: locations im state updaten (je nachdem wie du sie hältst)
                // z.B. setLocations(prev => prev.map(x => x.id===editing.id ? data : x))
              } finally {
                setLoading(false);
              }
            }}
            onDelete={async () => {
              if (!editing) return;
              const idToDelete = editing.id;

              
              try {
                await axios.delete(`/api/locations/${idToDelete}`);

                setLocations((prev) => prev.filter((x) => x.id !== idToDelete));
                setEditing(null); // Dialog schließen / selection reset
              } finally {
                setLoading(false);
                setEditing(null);
              }
            }}
          />

        </MapContainer>
      </div>

    </>

  );
}