import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer as bundleAnalyzer } from "rollup-plugin-visualizer";

export default defineConfig({
  optimizeDeps: {
    include: ["react-icons", "react-router-dom", "framer-motion"],
    
  },
  plugins: [
    react({
      jsxRuntime: "automatic",
    }),
    bundleAnalyzer({
      analyzerMode: "static",
      openAnalyzer: false,
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          icons: ["react-icons"],
          vendor: ["react-router-dom", "framer-motion"],
        },
      },
    },
    minify: "esbuild",
    target: "esnext",
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
  },
});
