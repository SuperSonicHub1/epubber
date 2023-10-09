import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    svelte(),
    // https://vite-pwa-org.netlify.app/guide/
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: command === 'serve' },
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'EPUBber',
        short_name: 'EPUBber',
        description: 'Making reading for betterment fun and addictive.',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icons/epubber.svg',
            size: '512x512',
            type: 'image/svg',
          },
          {
            src: 'icons/epubber.png',
            size: '192x192',
            type: 'image/png',
          }
        ]
      }
    })
  ],
  base: '/epubber/',
  // https://stackoverflow.com/a/76819780
  build: {
    target: 'esnext'
  }
}))
