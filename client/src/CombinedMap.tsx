import { useGeolocation } from "./hooks/useGeolocation";
import MapOnly from "./MapView";
import axios from "axios";
import { useState } from "react";
// import {Switch, Button} from "@mui/material";
import RouteSidebar from "./RouteSidebar";

export default function CombinedMap() {

  const { state, request } = useGeolocation();
  const [saving, setSaving] = useState(false);
  const[route, setRoute] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<number[]>([]);
  const[count, setCout] = useState<number>(0);
  const[newNodeCheck, setNewNodeCheck] = useState<boolean>(false)



  async function saveHere() {
    if (state.status !== "ready") return;

    const name = (prompt("Name/ID (optional):", "") ?? "").trim();

    setSaving(true);
    try {
      await axios.post("http://localhost:3000/new", {
        lat: state.coords.lat,
        lng: state.coords.lng,
        name: name,
      });
      alert("Gespeichert ✅");
      setSaving(false);
    } catch (e) {
      alert("Fehler beim Speichern ❌");
    } finally {
      setSaving(false);
    }
  }

  function sendNodeIds(){
    
  }

  return (
    <div style={{ height: "100vh", display: "flex" }}>
<RouteSidebar
  geo={state}
  onRetryGeo={request}
  saving={saving}
  onSaveHere={saveHere}
  routeMode={route}
  onToggleRouteMode={() => setRoute((r) => !r)}
  onPlanRoute={() => {
    sendNodeIds();
    setCout((prev) => prev + 1);
  }}
  selectionCheck = {newNodeCheck}
  setSelectionCheck = {setNewNodeCheck}
  selectedCount={selectedNodes.length}
  selectedNodes = {selectedNodes}
/>

      <div style={{ flex: 1 }}>
        <MapOnly newNodeCheck = {newNodeCheck} newRouteCount = {count} selectedNodes = {selectedNodes} setSelectedNodes = {setSelectedNodes} routeOption = {route} myPos={state.status === "ready" ? state.coords : undefined} />
      </div>
    </div>
  );
}