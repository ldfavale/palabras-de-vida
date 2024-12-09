import flowbitePlugin from 'flowbite/plugin';
import typographyPlugin from '@tailwindcss/typography';
/** @type {import('tailwindcss').Config} */
import withMT from "@material-tailwind/react/utils/withMT";

export default withMT({
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
    "node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}",
    "node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}",
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
    flowbitePlugin,
    typographyPlugin,
]
});
