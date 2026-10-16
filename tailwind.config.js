/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        epita: {
          dark: '#0B1020',
          card: '#151D30',
          cardHover: '#1B253D',
          border: '#222E47',
          cyan: '#38D9E6',
          cyanGlow: 'rgba(56, 217, 230, 0.15)',
          emerald: '#34D399',
          emeraldGlow: 'rgba(52, 211, 153, 0.15)',
          amber: '#FBBF24',
          rose: '#F87171',
          textMuted: '#94A3B8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
