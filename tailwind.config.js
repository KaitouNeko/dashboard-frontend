/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'Noto Sans TC', 'system-ui', 'sans-serif'],
        sora: ['Sora', 'Noto Sans TC', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'Noto Sans TC', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'inner-custom': 'var(--shadow-inner)',
        'sm-custom': 'var(--shadow-sm)',
        'md-custom': 'var(--shadow-md)',
        'lg-custom': 'var(--shadow-lg)',
        'xl-custom': 'var(--shadow-xl)',
        'card-custom': 'var(--card-shadow)',
        'object-custom': 'var(--object-shadow)',
        'highlight': 'var(--highlight-glow)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
} 