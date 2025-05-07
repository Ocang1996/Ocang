/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'accent-blue': '#34D399',
        'accent-green': '#10B981',
        'accent-purple': '#6EE7B7',
        'accent-pink': '#059669',
        'accent-yellow': '#A7F3D0',
        'accent-red': '#047857',
        'accent-teal': '#064E3B',
      },
      fontFamily: {
        sans: ['Intro', 'system-ui', 'sans-serif'],
        code: ['Consolas', 'Monaco', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 8px 0 rgba(16, 185, 129, 0.05)',
      },
    },
  },
  plugins: [],
};