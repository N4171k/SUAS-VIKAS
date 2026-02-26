/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337', // Rose/Red for that Airbnb "Raush" vibe
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a', // Slate grays
        },
        vikas: {
          orange: '#FF5A5F',
          blue: '#004E89',
          green: '#00A878',
          dark: '#222222',
          light: '#F5F5F5',
        },
        airbnb: {
          red: '#FF385C',
        },
      },
      fontFamily: {
        sans: ['Circular', 'Inter', 'system-ui', 'sans-serif'], // Airbnb uses Circular, fallback to Inter
      },
      boxShadow: {
        'clay': '8px 8px 16px 0px rgba(118, 118, 118, 0.15), -8px -8px 16px 0px rgba(255, 255, 255, 0.8)',
        'clay-hover': '12px 12px 20px 0px rgba(118, 118, 118, 0.2), -12px -12px 20px 0px rgba(255, 255, 255, 1)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
};
