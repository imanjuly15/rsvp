import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // Relative paths, so the built site works from any folder on any static host.
  base: './',
  // Two pages: the guest site and the admin page (built separately, so guests never download admin code).
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        admin: fileURLToPath(new URL('./admin.html', import.meta.url)),
      },
    },
  },
  server: { port: 3000, strictPort: true },
  preview: { port: 3000, strictPort: true },
});
