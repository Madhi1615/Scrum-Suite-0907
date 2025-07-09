import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/scrum-metrics-dashboard/",
  plugins: [react()]
})
