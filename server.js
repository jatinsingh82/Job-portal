import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import express from "express";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import app from "./backend/app.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cloudName = process.env.CLOUDINARY_CLIENT_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_CLIENT_API || process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_CLIENT_SECRET || process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.v2.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

const PORT = Number(process.env.PORT) || 3000;
const distPath = path.resolve(__dirname, "frontend/dist");

async function start() {
  if (process.env.NODE_ENV === "production" || fs.existsSync(path.join(distPath, "index.html"))) {
    console.log("[Job Portal] Serving static frontend build from frontend/dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    console.log("[Job Portal] Initializing Vite middleware in dev mode...");
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true, hmr: false, host: "0.0.0.0" },
        appType: "spa",
        root: path.resolve(__dirname, "frontend"),
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn("[Job Portal] Vite dev middleware error, falling back to static:", err.message);
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
          res.sendFile(path.join(distPath, "index.html"));
        });
      }
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Job Portal running on http://0.0.0.0:${PORT}`);
  });
}

start();
