/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e63946',
        dark: '#1a1a1a',
        'sage-green': '#8EA69B',
        'warm-beige': '#B5A596',
        'dark-gray': '#333333',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

