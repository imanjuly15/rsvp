import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // Relative paths, so the built site works from any folder on any static host.
  base: './',
  server: { port: 3000, strictPort: true },
  preview: { port: 3000, strictPort: true },
});
