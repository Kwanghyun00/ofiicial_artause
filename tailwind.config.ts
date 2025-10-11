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
      },
      fontFamily: {
        pretendard: ['"Pretendard Variable"', 'Pretendard', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 40px -24px rgba(36, 31, 71, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
