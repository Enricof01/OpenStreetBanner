import { Router } from "express";
import axios from "axios";
import type { Request, Response } from "express";

import { prisma } from "../lib/prisma";
import { HQ } from "./config"; 

const router = Router();
const OSRM_BASE = "https://router.project-osrm.org";

router.post("/trip", async (_req: Request, res: Response) => {
  try {

    const locIds : number []= _req.body.array;
    let locations = await prisma.location.findMany({ orderBy: { id: "asc" } });
    console.log(locIds);
      
    locations = locations.filter((l) => locIds.includes(l.id));

   


    // HQ muss als erster Punkt rein, damit source=first funktioniert
    const points = [
      { id: "HQ", lat: HQ.lat, lng: HQ.lng },
      ...locations.map((l) => ({ id: String(l.id), lat: l.lat, lng: l.lng })),
    ];

    if (points.length < 2) {
      return res.status(400).json({ error: "Need at least 2 points (HQ + >=1 location)" });
    }

    // OSRM erwartet lon,lat
    const coords = points.map((p) => `${p.lng},${p.lat}`).join(";");
    const url = `${OSRM_BASE}/trip/v1/driving/${coords}`;

    const { data } = await axios.get(url, {
      params: {
        roundtrip: "true",
        source: "first",
        steps: "false",
        overview: "full",
        geometries: "geojson",
      },
      timeout: 20000,
    });

    const trip0 = data?.trips?.[0];
    if (data?.code !== "Ok" || !trip0?.geometry) {
      return res.status(502).json({ error: "OSRM trip failed", osrm: data });
    }

    return res.json({
      distance: trip0.distance,
      duration: trip0.duration,
      geometry: trip0.geometry,   // GeoJSON LineString
      waypoints: data.waypoints,
      inputPoints: points,
    });
  } catch (err: any) {
    console.error("OSRM trip error:", err?.message ?? err);
    return res.status(500).json({ error: "OSRM request failed" });
  }
});

export default router;