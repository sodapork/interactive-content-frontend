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
        background: '#ffffff',
        surface: '#f8fafc',
        accent: '#14532d',
        accent2: '#e5e7eb',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        black: '#000',
        white: '#fff',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 