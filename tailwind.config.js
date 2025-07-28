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
        lightgrey: '#A9B1BE',
        secondary: '#AEBF8A',
        third: '#897671'
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        pulseSlow: {
          '0%, 100%': {
            opacity: '0.3',
            transform: 'scale(0.9)',
          },
          '50%': {
            opacity: '0.6',
            transform: 'scale(1)',
          },
        },
      },
      animation: {
        blob: 'blob 7s infinite',
        'pulse-slow': 'pulseSlow 3s infinite ease-in-out',
      },
    },
  },
  plugins: [
    flowbitePlugin,
    typographyPlugin,
]
});
