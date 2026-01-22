/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // --- 1. TYPOGRAPHIE PREMIUM ---
      fontFamily: {
        // 'Montserrat' pour le corps de texte : Moderne, géométrique, lisible.
        sans: ['Montserrat', ...defaultTheme.fontFamily.sans], 
        // 'Playfair Display' pour les titres : Élégant, classique, luxe.
        serif: ['Playfair Display', ...defaultTheme.fontFamily.serif], 
      },
      
      // --- 2. PALETTE DE COULEURS MAJORELLE ---
      colors: {
        // LE BLEU ICONIQUE (Plus profond et intense)
        primary: {
          50: '#EDF5FF', // Très clair (fonds subtils)
          100: '#D0E6FF',
          200: '#A3CFFF',
          300: '#71B2FF',
          400: '#3E8EFF',
          500: '#0050AA', // <--- NOTRE BLEU MAJORELLE DE BASE (Vibrant)
          600: '#003F88', // Hover
          700: '#002F66', // Textes foncés / Footer
          800: '#002044',
          900: '#001022',
        },
        // TERRACOTTA / ORANGE BRÛLÉ (Action & Contraste)
        accent: {
          50: '#FFF2ED',
          100: '#FFDFC9',
          200: '#FFBFA6',
          300: '#FF9E82',
          400: '#FF7D5F',
          500: '#D64521', // <--- NOTRE COULEUR D'ACTION (Terracotta chaud)
          600: '#B03618', // Hover bouton
          700: '#8A2810',
        },
        // SABLE / CRÈME (Fonds chaleureux)
        sand: {
          50: '#FAFAF7', // <--- Fond de page principal (Blanc cassé chaud)
          100: '#F2EFE6', // Fonds secondaires
          200: '#E6E0D1', // Bordures subtiles
          300: '#D1C7B0',
          700: '#7D7361', // Textes secondaires
          800: '#5E574A',
          900: '#3D3830', // Textes principaux (pas noir pur)
        }
      },
      
      // --- 3. OMBRES & PROFONDEUR ---
      boxShadow: {
        // Ombre douce avec une teinte bleutée pour le header
        'premium': '0 4px 20px -2px rgba(0, 80, 170, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.03)', 
        // Ombre pour les formulaires, plus marquée pour les détacher du fond
        'card': '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 10px -3px rgba(0, 0, 0, 0.02)', 
      },

      // --- 4. ANIMATIONS ---
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}