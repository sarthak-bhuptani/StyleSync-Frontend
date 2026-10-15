/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#F6F4EE',
          card: '#FFFFFF',
          warm: '#EFECE5',
          border: '#E5E0D6',
          dark: '#141714',
        },
        pine: {
          50: '#F2F6F3',
          100: '#E2ECE3',
          200: '#C5D8C7',
          300: '#9DBDA0',
          400: '#6E9873',
          500: '#3A5C3F',
          600: '#2A442E',
          700: '#1E2E22', // Primary Figma pine
          800: '#162319',
          900: '#0F1811',
          DEFAULT: '#1E2E22',
        },
        sand: {
          50: '#FAF8F5',
          100: '#F3EFE8',
          200: '#EAE5DB',
          300: '#DDD5C8',
          400: '#CCC2B0',
          DEFAULT: '#EAE5DB',
        },
        terracotta: {
          DEFAULT: '#C86D51',
          light: '#F8ECE7',
          dark: '#A6533A',
        },
        ink: {
          primary: '#1A1D1A',
          muted: '#687066',
          subtle: '#8F978D',
        },
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
          DEFAULT: '#1E2E22',
          light: '#E2ECE3',
          dark: '#162319',
        },
        maybe: {
          DEFAULT: '#C86D51',
          light: '#F8ECE7',
          dark: '#A6533A',
        },
        skip: {
          DEFAULT: '#9E3A3A',
          light: '#FDF1F1',
          dark: '#7D2626',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'Outfit', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        display: ['Newsreader', 'Plus Jakarta Sans', 'serif'],
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
