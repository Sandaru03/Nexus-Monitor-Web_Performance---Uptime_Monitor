/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'glass-bg': 'rgba(255, 255, 255, 0.05)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
        'glass-card': 'rgba(17, 25, 40, 0.75)',
        'neon-green': '#39ff14',
        'neon-red': '#ff073a',
      },
      backdropBlur: {
        'glass': '16px',
      }
    },
  },
  plugins: [],
}
