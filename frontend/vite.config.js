import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";  // Changed from plugin-react-swc

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:5000",
      "/uploads": "http://localhost:5000"
    }
  }
});