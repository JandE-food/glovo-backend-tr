/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        shell: '#1A1A1A',
        surface: '#FFFFFF',
        surfaceSoft: '#FFF4EE',
        page: '#FFF8F4',
        accent: '#FF5A3C',
        accentSoft: '#FFE3DB',
        ink: '#1A1A1A',
        muted: '#6B7280',
        success: '#1F9D55',
        warning: '#F59E0B'
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0, 0, 0, 0.05)',
        shell: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      },
      fontFamily: {
        display: ['Inter', '"Segoe UI"', 'sans-serif'],
        body: ['Inter', '"Segoe UI"', 'sans-serif']
      }
    }
  },
  plugins: []
};
