import fs from "fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // https: {
    //   key: fs.readFileSync("./certs/localhost+2-key.pem"),
    //   cert: fs.readFileSync("./certs/localhost+2.pem"),
    // },
    proxy: {
      "/api": "http://127.0.0.1:3000",
    },
  },
});