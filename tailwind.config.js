/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // --- 1. TYPOGRAPHIE (Charte: IvyPresto Serif + Effra Sans) ---
      fontFamily: {
        // IvyPresto Display for headings (serif). Fallback: Playfair Display, Georgia
        serif: ['"IvyPresto Display"', '"Playfair Display"', 'Georgia', ...defaultTheme.fontFamily.serif],
        // Effra for body text (sans-serif). Fallback: Inter, system
        sans: ['Effra', 'Inter', 'system-ui', ...defaultTheme.fontFamily.sans],
      },

      // --- 2. PALETTE CHARTE GRAPHIQUE FONDATION ---
      colors: {
        // Soft Teal — Primary
        teal: {
          50:  '#f0f7f6',
          100: '#d9eeec',
          200: '#b3ddd9',
          300: '#8dccc6',
          400: '#7dafab', // ← #7dafab exact brand
          500: '#5d9691',
          600: '#4a7a76',
          700: '#336d68', // ← #336d68 exact brand (darker teal)
          800: '#285550',
          900: '#1d3e3b',
        },
        // Golden Amber — Secondary / Accent
        amber: {
          50:  '#fffbeb',
          100: '#fff4cc',
          200: '#ffe999',
          300: '#ffde66',
          400: '#f8b200', // ← #f8b200 exact brand
          500: '#d99900',
          600: '#b37f00',
          700: '#8c6500',
          800: '#664b00',
          900: '#4d3800',
        },
        // Ivory Sand — Surface / Backgrounds
        ivory: {
          50:  '#fffefb',
          100: '#fffae3', // ← #fffae3 exact brand
          200: '#fff6d4',
          300: '#fff1c2',
          400: '#ffecad',
          500: '#ffe799',
          600: '#e6d186',
          700: '#ccba73',
          800: '#b3a360',
          900: '#998c4d',
        },
        // Deep Teal — Dark text and accents
        deepTeal: {
          50:  '#e8efee',
          100: '#c5d6d4',
          200: '#7f9e9a',
          300: '#5a7d78',
          400: '#395c57',
          500: '#2a4642',
          600: '#1f3936',
          700: '#183230', // ← #183230 exact brand (very dark teal)
          800: '#122622',
          900: '#0c1a18',
        },
        // Keep original palette for backward compat
        primary: {
          50: '#EDF5FF',
          100: '#D0E6FF',
          200: '#A3CFFF',
          300: '#71B2FF',
          400: '#3E8EFF',
          500: '#0050AA',
          600: '#003F88',
          700: '#002F66',
          800: '#002044',
          900: '#001022',
        },
        accent: {
          50: '#FFF2ED',
          100: '#FFDFC9',
          200: '#FFBFA6',
          300: '#FF9E82',
          400: '#FF7D5F',
          500: '#D64521',
          600: '#B03618',
          700: '#8A2810',
        },
        sand: {
          50: '#FAFAF7',
          100: '#F2EFE6',
          200: '#E6E0D1',
          300: '#D1C7B0',
          700: '#7D7361',
          800: '#5E574A',
          900: '#3D3830',
        },
      },

      // --- 3. OMBRES & PROFONDEUR ---
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(0, 80, 170, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
        'card': '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 10px -3px rgba(0, 0, 0, 0.02)',
        'hero-btn': '0 0 30px rgba(125, 175, 171, 0.4)',
      },

      // --- 4. ANIMATIONS ---
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-up-delay': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s backwards',
        'fade-in-up-delay-2': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s backwards',
        'fade-in-up-delay-3': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s backwards',
        'ken-burns': 'kenBurnsOrganic 50s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate',
        'ken-burns-initial': 'kenBurnsInitial 3s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'sky-breathe': 'skyBreathe 28s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'atmospheric-drift': 'atmosphericDrift 35s ease-in-out infinite alternate',
        'atmospheric-drift-slow': 'atmosphericDriftSlow 50s ease-in-out infinite alternate-reverse',
        'light-ray-sweep': 'lightRaySweep 20s ease-in-out infinite',
        'scroll-line': 'scrollLine 2s ease-in-out infinite',
        'hero-title': 'heroTitle 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.3s backwards',
        'hero-subtitle': 'heroSubtitle 1s cubic-bezier(0.16, 1, 0.3, 1) 0.9s backwards',
        'hero-buttons': 'heroButtons 1s cubic-bezier(0.16, 1, 0.3, 1) 1.2s backwards',
        'hero-foreground': 'heroForeground 1.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s backwards',
        'scroll-hint': 'scrollHint 2.5s ease-in-out infinite',
        'float-particle': 'floatParticle 20s ease-in-out infinite',
        'float-particle-reverse': 'floatParticleReverse 25s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        kenBurnsOrganic: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '20%': { transform: 'scale(1.03) translate(-0.5%, -1%)' },
          '40%': { transform: 'scale(1.06) translate(-1.5%, 0.5%)' },
          '60%': { transform: 'scale(1.08) translate(0.5%, -0.8%)' },
          '80%': { transform: 'scale(1.05) translate(-1%, 0.3%)' },
          '100%': { transform: 'scale(1.1) translate(-1.2%, -1.5%)' },
        },
        kenBurnsInitial: {
          '0%': { opacity: '0', transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        skyBreathe: {
          '0%, 100%': { filter: 'brightness(1) saturate(1)' },
          '33%': { filter: 'brightness(1.05) saturate(1.08)' },
          '66%': { filter: 'brightness(1.08) saturate(1.15)' },
        },
        atmosphericDrift: {
          '0%': { transform: 'translateX(0) translateY(0)', opacity: '0.15' },
          '25%': { opacity: '0.25' },
          '50%': { transform: 'translateX(-30px) translateY(-20px)', opacity: '0.2' },
          '75%': { opacity: '0.3' },
          '100%': { transform: 'translateX(-60px) translateY(10px)', opacity: '0.18' },
        },
        atmosphericDriftSlow: {
          '0%': { transform: 'translateX(0) translateY(0) scale(1)', opacity: '0.1' },
          '33%': { opacity: '0.2' },
          '66%': { transform: 'translateX(40px) translateY(-30px) scale(1.05)', opacity: '0.15' },
          '100%': { transform: 'translateX(80px) translateY(20px) scale(1.1)', opacity: '0.12' },
        },
        lightRaySweep: {
          '0%': { transform: 'translateX(-100%) rotate(-5deg)', opacity: '0' },
          '10%': { opacity: '0.08' },
          '50%': { opacity: '0.15' },
          '90%': { opacity: '0.08' },
          '100%': { transform: 'translateX(100%) rotate(-5deg)', opacity: '0' },
        },
        scrollLine: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '40%': { opacity: '1' },
          '100%': { transform: 'translateY(200%)', opacity: '0' },
        },
        heroTitle: {
          '0%': { opacity: '0', transform: 'translateY(60px) scale(0.9)', filter: 'blur(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)', filter: 'blur(0)' },
        },
        heroSubtitle: {
          '0%': { opacity: '0', transform: 'translateY(20px)', letterSpacing: '0.5em' },
          '100%': { opacity: '0.9', transform: 'translateY(0)', letterSpacing: '0.3em' },
        },
        heroButtons: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        heroForeground: {
          '0%': { opacity: '0', transform: 'translateY(80px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scrollHint: {
          '0%, 100%': { opacity: '0.4', transform: 'translateY(0)' },
          '50%': { opacity: '1', transform: 'translateY(12px)' },
        },
        floatParticle: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(30px, -20px) rotate(90deg)' },
          '50%': { transform: 'translate(-10px, -40px) rotate(180deg)' },
          '75%': { transform: 'translate(-30px, -10px) rotate(270deg)' },
        },
        floatParticleReverse: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(-20px, -30px) rotate(-90deg)' },
          '50%': { transform: 'translate(15px, -20px) rotate(-180deg)' },
          '75%': { transform: 'translate(25px, -40px) rotate(-270deg)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}