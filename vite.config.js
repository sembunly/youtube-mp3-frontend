import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],

  // LOCAL DEVELOPMENT ONLY

  //
  // React:
  // http://localhost:5173
  //
  // Express:
  // http://localhost:3000
  //
  // Browser calls:
  // /download
  //
  // Vite forwards it to:
  // http://localhost:3000/download

  server: {
    proxy: {
      "/download": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },

      "/health": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },

  // PRODUCTION:
  // Vite proxy above is NOT used after `npm run build`.
  //
  // In production use VITE_API_URL instead:
  //
  // VITE_API_URL=https://api.yourdomain.com
});
