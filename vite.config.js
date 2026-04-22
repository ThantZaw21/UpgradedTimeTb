import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [ 
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'UCSMTLA 4CS(S) Timetable',
        short_name: 'Timetable',
        description: 'Class Schedule for 4th Year Senior',
        theme_color: '#0f172a',
        background_color: '#f8fafc',
        display: 'standalone', 
        icons: [
          {
            src: 'Meiktila2.png', // Using your specific file
            sizes: '192x192 512x512', // Tells the phone to use this for all sizes
            type: 'image/png'
          }
        ]
      }
    })
  ],
})