import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/send-email': 'http://localhost:3006',
      '/send-rejection-email': 'http://localhost:3006'
    }
  }
});
