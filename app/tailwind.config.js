/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    {
      pattern: /!?bg-\[#([0-9a-fA-F]{3}){1,2}\]/,
      variants: ['hover', 'focus'],
    },
    {
      pattern: /!?text-\[#([0-9a-fA-F]{3}){1,2}\]/,
      variants: ['hover', 'focus'],
    },
  ],
}