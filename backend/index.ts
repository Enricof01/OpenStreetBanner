import "dotenv/config";
import express from "express";
import getOsrmRoute from "./routes/osrmRoutes"
// import cors from "cors"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

const app = express();
// app.use(cors());
app.use(express.json());
app.use("/api/osrm", getOsrmRoute);

app.get("/", async (_req, res) => {
  await prisma.$connect();
  res.json({ ok: true, message: "Server läuft", db: "connected" });
});

app.post("/api/new", async(req, res) => {
  const loc = req.body;
  await prisma.location.create({
    data: {
        name: loc.name,
        lat: loc.lat,
        lng: loc.lng,
        updatedAt: new Date(),
        Message: "",
    },
  })
})

app.get("/api/getlocs", async(req, res) => {
  const locs = await prisma.location.findMany();
  res.json(locs);
})

app.patch("/api/locations/:id", async (req, res) => {

  const id = req.params.id;
  const draft = req.body;
  console.log(req.params.id)
  await prisma.location.update({
    where: {id: Number(id)},
    data: {
      Message: draft.Message,
      name: draft.name,
      status: draft.status,
    },
  })

  res.json(draft);


})

app.delete("/api/locations/:id", async(req, res) => {
  const id = req.params.id;
  await prisma.location.delete({
    where: {id: Number(id)}
  })
})

app.listen(3000, "0.0.0.0",  () => console.log("läuft auf port 3000"));