/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#fdf8f6',
          100: '#f2e8e2',
          200: '#ebd0c5',
          300: '#d9a893',
          400: '#c67e5f',
          500: '#b86441',
          600: '#a34f36',
          700: '#87412f',
          800: '#6f372b',
          900: '#5b2f26',
          950: '#3d1712',
        },
        cream: {
          50: '#fffcf5',
          100: '#fef7e5',
          200: '#fdecc6',
          300: '#fbdc9d',
          400: '#f8c471',
          500: '#f4a74b',
          600: '#e58c29',
          700: '#c17020',
          800: '#9d581e',
          900: '#7f491d',
          950: '#45240c',
        },
      },
      backgroundImage: {
        'coffee-gradient': 'linear-gradient(135deg, #3d1712 0%, #6f372b 50%, #87412f 100%)',
        'cream-gradient': 'linear-gradient(135deg, #fef7e5 0%, #fbdc9d 50%, #f8c471 100%)',
        'hero-gradient': 'radial-gradient(ellipse at center, rgba(61,23,18,0.95) 0%, rgba(87,65,47,0.85) 50%, rgba(111,55,43,0.95) 100%)',
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}