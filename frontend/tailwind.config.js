/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B1120',
          950: '#0A0F1A',
        },
        teal: {
          400: '#2DD4BF',
          500: '#14B8A6',
        },
        blue: {
          400: '#60A5FA',
          500: '#3B82F6',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 20px rgba(45, 212, 191, 0.3)'
          },
          '50%': { 
            opacity: '0.7',
            boxShadow: '0 0 40px rgba(45, 212, 191, 0.5)'
          },
        }
      }
    },
  },
  plugins: [],
}
