/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        tablet: '800px', // Custom breakpoint for ≥800px
      },
      colors: {
        primary: '#FFF0CE',
        secondary: '#FFC436',
        tertiary: '#0174BE',
        fourth: '#0C356A',
      },
    },
  },
  plugins: [],
}

//povide me the gui of certain using this color tamplete givewn above and also using the framer motion libary 


//use this color palette =====> primary:FFF0CE, secondary: FFC436, tertiary: 0174BE,fourth: 0C356A