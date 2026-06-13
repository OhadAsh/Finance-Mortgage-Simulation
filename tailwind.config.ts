import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0F172A',
        card: '#1E293B',
        accent: '#10B981',
        amber: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Heebo', 'Inter', 'sans-serif'],
        mono: ['Inter', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
