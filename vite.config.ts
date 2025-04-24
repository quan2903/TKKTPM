import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { allowedHosts: ['b117-2405-4803-f586-9600-e02e-deb4-cd1a-916d.ngrok-free.app'] },
})
