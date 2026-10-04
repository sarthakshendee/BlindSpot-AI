/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0d14',
          card: '#111726',
          cardHover: '#161e31',
          surface: '#182035',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(99, 102, 241, 0.4)',
          text: '#f1f5f9',
          muted: '#94a3b8',
        },
        brand: {
          blue: '#3b82f6',
          indigo: '#6366f1',
          violet: '#8b5cf6',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      boxShadow: {
        'glow-blue': '0 0 35px -5px rgba(59, 130, 246, 0.25)',
        'glow-indigo': '0 0 35px -5px rgba(99, 102, 241, 0.3)',
        'glow-cyan': '0 0 35px -5px rgba(6, 182, 212, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.08) 35%, rgba(10, 13, 20, 0) 70%)',
      }
    },
  },
  plugins: [],
}
