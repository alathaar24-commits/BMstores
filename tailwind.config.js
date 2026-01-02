/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Penting untuk fitur Admin Theme Control
  theme: {
    extend: {
      colors: {
        "primary": "#00bb83ff", // Warna orange khas BM Store
        "background-light": "#f8f7f5",
        "background-dark": "#000000ff",
      }
    },
  },
  plugins: [],
}