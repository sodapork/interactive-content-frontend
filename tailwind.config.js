/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    'bg-background', 'bg-surface', 'bg-accent', 'bg-accent2',
    'text-text', 'text-textSecondary',
    'border-accent', 'border-accent2', 'border-accent/20', 'border-accent/30'
  ],
  theme: {
    extend: {
      colors: {
        background: '#181824',
        surface: '#232336',
        accent: '#7f5af0',
        accent2: '#3b82f6',
        text: '#fff',
        textSecondary: '#e5e7eb',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 