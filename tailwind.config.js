/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        aphrodite: ["aphrodite"],
        now: ["now"],
        italiana: ["italiana"],
        gayathri: ["gayathri"],
        gilroy: ["gilroy"],
        graphik: ["graphik"],
      },
      colors: {
        primary: '#FDCA40',
        primary_light: '#EDCF70',
        error: '#ED4956',
        white: '#fff',
        black: '#444E5E',
        grey: '#666666',
        lightgrey: '#A9B1BE'
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
]
}
