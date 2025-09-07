/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#7c8cff',
          accent: '#a78bfa',
          secondary: '#e879f9',
        },
        surface: {
          glass: 'rgba(255, 255, 255, 0.08)',
        },
        text: {
          primary: '#e6e9f5',
          muted: '#b8bdd5',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'gradient-slow': 'gradient-slow 16s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'gradient-slow': {
          '0%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-2%,0)' },
          '100%': { transform: 'translate3d(0,0,0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 20px 60px -20px rgba(0,0,0,0.6)',
        'focus': '0 0 0 2px rgba(124, 140, 255, 0.5)',
      }
    },
  },
  plugins: [],
}
