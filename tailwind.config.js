/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#E0F2FF',
          DEFAULT: '#2196F3',
          dark: '#1565C0',
        },
        accent: '#25D366',
      },
      borderRadius: {
        card: '1rem',
      },
    },
  },
  plugins: [],
};
