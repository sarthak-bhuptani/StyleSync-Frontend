/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Emerald Core
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        obsidian: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a', // Midnight Obsidian
          950: '#060f1e', // Login Card Midnight
        },
        buy: {
          DEFAULT: '#10b981',
          light: '#ecfdf5',
          dark: '#047857',
        },
        maybe: {
          DEFAULT: '#f59e0b',
          light: '#fffbeb',
          dark: '#b45309',
        },
        skip: {
          DEFAULT: '#ef4444',
          light: '#fef2f2',
          dark: '#b91c1c',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(28, 25, 23, 0.04), 0 1px 2px -1px rgba(28, 25, 23, 0.04)',
        'card': '0 4px 24px -2px rgba(28, 25, 23, 0.06), 0 2px 8px -1px rgba(28, 25, 23, 0.03)',
        'bento': '0 8px 30px -4px rgba(28, 25, 23, 0.07), 0 4px 12px -2px rgba(28, 25, 23, 0.03)',
        'floating': '0 20px 40px -6px rgba(28, 25, 23, 0.10), 0 12px 20px -6px rgba(28, 25, 23, 0.05)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      }
    },
  },
  plugins: [],
}
