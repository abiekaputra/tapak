// Module responsible for configuring the Tapak operator console build.
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: { port: 4173 },
  preview: { port: 4173 },
});
