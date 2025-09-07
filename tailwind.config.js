/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'primary': '#4F46E5',
        'secondary': '#EC4899',
        'accent': '#10B981',
      },
      backgroundImage: {
        'gradient-light': 'linear-gradient(to right, #E0F2FE, #FCE7F3)',
        'gradient-dark': 'linear-gradient(to right, #1E1B4B, #1E293B)',
        'radial-fade': 'radial-gradient(1200px 800px at 10% 10%, rgba(99,102,241,0.15), transparent), radial-gradient(1200px 800px at 90% 20%, rgba(34,197,94,0.12), transparent), radial-gradient(800px 600px at 50% 90%, rgba(236,72,153,0.12), transparent)'
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
  ],
}
