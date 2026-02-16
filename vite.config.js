import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Important pour le déploiement - chemins relatifs
  server: {
    host: true, // Permet l'accès depuis mobile sur le même réseau
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined, // Meilleure compatibilité mobile
      }
    },
    target: 'es2015', // Support iOS Safari 10.3+ et Android Chrome 51+
    cssCodeSplit: false, // Un seul fichier CSS pour éviter les problèmes de chargement
    minify: 'terser', // Meilleure compression
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer les console.log en production
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-i18next', 'i18next', 'axios'],
  }
})
