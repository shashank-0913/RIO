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
        dark: {
          bg: '#121212',
          card: '#1E1E1E',
          cardElevated: '#262626',
          border: '#2E2E2E',
          text: '#F9FAFB',
          muted: '#9CA3AF'
        },
        paper: {
          bg: '#F8F9FA',
          card: '#FFFFFF',
          cardElevated: '#F1F3F5',
          border: '#E9ECEF',
          text: '#111827',
          muted: '#6B7280'
        },
        brand: {
          emerald: '#10B981',
          emeraldDark: '#059669',
          amber: '#F59E0B',
          amberDark: '#D97706'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

