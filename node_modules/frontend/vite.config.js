import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  server:
    command === "serve"
      ? {
          proxy: {
            "/api": "http://localhost:5000",
            "/uploads": "http://localhost:5000",
          },
          historyApiFallback: true,
        }
      : undefined,
  build: {
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600,
  },
}));
