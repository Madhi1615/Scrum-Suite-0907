import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/scrum-metrics-dashboard/", // Replace with your GitHub repo name if different
  plugins: [react()]
})
