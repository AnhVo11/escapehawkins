import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // listen on all addresses, not just localhost
    port: 5174,      // fixed port so it's easy to remember
  },
})
