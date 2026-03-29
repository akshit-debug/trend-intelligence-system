/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zinc: {
          950: '#09090b',
        },
        brand: {
          500: '#6366f1', // Indigo
          600: '#4f46e5',
        },
        accent: {
          cyan: '#22d3ee',
          purple: '#a855f7',
          emerald: '#10b981',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Outfit', 'ui-sans-serif', 'system-ui'],
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at top center, var(--tw-gradient-from), transparent 70%)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}
