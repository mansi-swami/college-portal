/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 👈 important for TSX files
  ],
  darkMode: "class", 
  theme: {
    extend: {},
  },
  plugins: [],
}
