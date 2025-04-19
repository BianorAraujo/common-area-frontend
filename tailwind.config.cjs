/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "vesta-dark": "#1A3C34", // Verde escuro
        "vesta-dark-hover": "#2E5C4F", // Verde hover
        "vesta-light": "#A8D5BA", // Verde claro
        "vesta-text": "#1F2A44", // Cinza escuro texto
      },
    },
  },
  plugins: [],
};