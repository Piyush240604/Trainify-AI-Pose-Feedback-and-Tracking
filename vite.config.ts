import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
import Terminal from 'vite-plugin-terminal'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    Terminal(),
  ],
  server: {
    host: '0.0.0.0', // Allow access from other devices
    port: 5173,
    allowedHosts: true,
    strictPort: true,
    cors: true, // Enable CORS
    hmr: {
      protocol: 'ws',
      host: 'localhost', // or your IP
    }
  }
});
