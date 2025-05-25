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
        background: '#0f0f1a',
        surface: '#1a1a2e',
        accent: '#6366f1',
        accent2: '#4f46e5',
        text: '#ffffff',
        textSecondary: '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 