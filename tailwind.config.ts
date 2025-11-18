import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#5B4BFF',
          dark: '#241F47',
          accent: '#FF8D7A',
          muted: '#A9A5D6',
        },
        surface: {
          100: '#F6F6FB',
          200: '#ECECF5',
          900: '#0F0D1D',
        },
        // 2025 Design System - Neutral & Coral Accent
        neutral: {
          offwhite: '#FBF7F2',
          taupe: '#EFE8DB',
        },
        coral: {
          DEFAULT: '#FF6B6B',
          light: '#FF8E8E',
          dark: '#E85555',
        },
        deepPurple: {
          DEFAULT: '#6D28D9',
          light: '#8B5CF6',
          dark: '#5B21B6',
        },
        // Deep Gradient colors for hero sections
        gradient: {
          violet: '#5E3AE3',
          magenta: '#D618A0',
          electric: '#8247E5',
        },
      },
      fontFamily: {
        pretendard: ['"Pretendard Variable"', 'Pretendard', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 40px -24px rgba(36, 31, 71, 0.35)',
      },
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        shimmer: 'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [],
};

export default config;
