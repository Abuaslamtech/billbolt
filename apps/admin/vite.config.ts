import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const targetBackend = env.VITE_BACKEND_URL || 'https://billbolt-v6de.onrender.com';

  return {
    plugins: [react()],
    server: {
      port: 3001,
      proxy: {
        '/api': {
          target: targetBackend,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
