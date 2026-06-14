import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          forms: ['@hookform/resolvers/zod', 'react-hook-form', 'zod'],
          query: ['@tanstack/react-query'],
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
