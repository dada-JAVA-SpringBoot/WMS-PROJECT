import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      host: true, // Allow connections from local network (LAN)
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:8085',
          changeOrigin: true,
        },
        '/ws': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:8085',
          ws: true,
        }
      }
    }
  }
})
