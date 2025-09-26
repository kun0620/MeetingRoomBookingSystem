/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'xs': '475px', // Custom breakpoint for extra small screens
      },
    },
  },
  safelist: [
    {
      pattern: /(from|via|to)-(green|emerald|orange|amber)-(100|200|300|400|500|600|700|800|900)/,
    },
  ],
  plugins: [],
};
