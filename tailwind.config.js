/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#0f172a',
          950: '#090d16',
        },
        risk: {
          low: {
            bg: '#ecfdf5',
            border: '#a7f3d0',
            text: '#047857',
            badge: '#10b981',
          },
          medium: {
            bg: '#fffbeb',
            border: '#fde68a',
            text: '#b45309',
            badge: '#f59e0b',
          },
          high: {
            bg: '#fef2f2',
            border: '#fecaca',
            text: '#b91c1c',
            badge: '#ef4444',
          }
        }
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
};
