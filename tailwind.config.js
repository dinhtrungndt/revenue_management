 /** @type {import('tailwindcss').Config} */
 export default {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [],
  extend: {
    animation: {
      'fade-in-down': 'fade-in-down 0.5s ease-out',
    },
    keyframes: {
      'fade-in-down': {
        '0%': {
          opacity: '0',
          transform: 'translateY(-10px)',
        },
        '100%': {
          opacity: '1',
          transform: 'translateY(0)',
        },
      }
    },
  },
  plugins: [
    function({ addComponents }) {
      addComponents({
        '.line-clamp-2': {
          display: '-webkit-box',
          '-webkit-line-clamp': '2',
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
        },
      });
    },
  ],
}