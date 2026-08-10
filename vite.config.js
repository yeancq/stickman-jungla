import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// IMPORTANT: change "base" to match your GitHub repo name so assets
// resolve correctly on GitHub Pages, e.g. "/stickman-jungla/".
// If you deploy to a custom domain or to the root of a user/org page
// (username.github.io), set base to "/" instead.
export default defineConfig({
  base: "/stickman-jungla/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "La Persecución — Stickman Jungla",
        short_name: "Persecución",
        description: "Escapa del monstruo de la jungla con tu stickman y sus habilidades especiales.",
        theme_color: "#1C5A2E",
        background_color: "#F4F1E9",
        display: "standalone",
        orientation: "any",
        start_url: "/stickman-jungla/",
        scope: "/stickman-jungla/",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"]
      }
    })
  ]
});
