/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f7f8fa', 100: '#eef0f4', 200: '#d6dae0', 300: '#b8bdc6', 400: '#8b919c',
          500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827', 950: '#080b14',
        },
        accent: {
          DEFAULT: '#22d3ee', 50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9',
          400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease both',
        'fade-up': 'fadeInUp 0.45s ease both',
        'pop': 'pop 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
        'like-burst': 'likeBurst 0.45s ease',
        'shimmer': 'shimmer 1.4s infinite linear',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        fadeInUp: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pop: { '0%': { transform: 'scale(0.9)', opacity: 0 }, '60%': { transform: 'scale(1.04)' }, '100%': { transform: 'scale(1)', opacity: 1 } },
        likeBurst: { '0%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.4)' }, '100%': { transform: 'scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        slideUp: { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
