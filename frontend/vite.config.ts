import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    server: {
      host: '::',         // Accept connections from all interfaces (including LAN/IPv6)
      port: 8081,         // Custom dev server port
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        }
      }
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(), // Only enable in dev
    ].filter(Boolean),    // Remove falsey entries (e.g., componentTagger in prod)
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // Absolute import alias
      },
    },
  };
});
