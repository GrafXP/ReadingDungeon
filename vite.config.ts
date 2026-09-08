import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['app-icon.svg', 'app-icon-192.png', 'app-icon-512.png'],
      manifest: {
        name: 'ReadingDungeon – Die Morgenklinge von Talora',
        short_name: 'ReadingDungeon',
        description: 'Ein deutschsprachiges Text-Abenteuerspiel für Kinder.',
        theme_color: '#183f38',
        background_color: '#f6ecd1',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'de-CH',
        orientation: 'any',
        icons: [
          {
            src: 'app-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'app-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'app-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Take control on the first visit; updates still wait for the prompt
        // because registerType 'prompt' leaves skipWaiting off.
        clientsClaim: true,
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,woff2}']
      },
      devOptions: { enabled: false }
    })
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['tests/e2e/**', '**/node_modules/**', '**/.git/**'],
    restoreMocks: true
  }
})
