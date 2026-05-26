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
        // Stage Gold — Primary brand palette (mirrors CSS custom properties)
        brand: {
          primary:  'oklch(0.64 0.18 55)',   // Stage amber-gold (light)
          'primary-dark': 'oklch(0.74 0.17 62)', // Bright stage gold (dark)
          accent:   'oklch(0.58 0.22 38)',   // Ember — passion orange
          'accent-dark': 'oklch(0.68 0.21 45)',
          ink:      'oklch(0.12 0.018 25)',  // Rich ink (foreground)
          velvet:   'oklch(0.11 0.016 285)', // Deep velvet (dark bg)
          muted:    'oklch(0.52 0.012 25)',  // Muted text
        },
        // Surface palette
        surface: {
          ivory:  'oklch(0.985 0.007 80)',  // Warm ivory (light bg)
          warm:   'oklch(0.95 0.009 80)',   // Warm light gray (secondary)
          border: 'oklch(0.90 0.009 80)',   // Warm border (light)
          card:   'oklch(1 0 0)',
          'dark-bg':    'oklch(0.11 0.016 285)',
          'dark-card':  'oklch(0.155 0.016 285)',
          'dark-border':'oklch(0.23 0.016 285)',
        },
        // CSS variable aliases — for components using var(--primary) pattern
        primary:     'var(--primary)',
        secondary:   'var(--secondary)',
        accent:      'var(--accent)',
        background:  'var(--background)',
        foreground:  'var(--foreground)',
        border:      'var(--border)',
        ring:        'var(--ring)',
        muted:       'var(--muted)',
        destructive: 'var(--destructive)',
      },
      fontFamily: {
        pretendard: ['"Pretendard Variable"', 'Pretendard', 'Inter', 'sans-serif'],
        display:    ['"Pretendard Variable"', 'Pretendard', 'sans-serif'],
      },
      borderRadius: {
        xs:   '4px',
        sm:   '8px',
        md:   '12px',
        lg:   '14px',   // --radius default
        xl:   '18px',
        '2xl':'24px',
      },
      boxShadow: {
        // Stage Gold shadow system
        xs:    '0 1px 3px rgba(0, 0, 0, 0.06)',
        sm:    '0 2px 8px -2px rgba(0, 0, 0, 0.09)',
        md:    '0 8px 24px -8px rgba(0, 0, 0, 0.12)',
        lg:    '0 20px 48px -16px rgba(0, 0, 0, 0.16)',
        xl:    '0 32px 64px -24px rgba(0, 0, 0, 0.2)',
        stage: '0 8px 32px -12px rgba(190, 120, 10, 0.18), 0 20px 48px -24px rgba(190, 120, 10, 0.1)',
        // Legacy alias
        soft:  '0 20px 40px -24px rgba(36, 31, 71, 0.35)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring:     'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'in-out':   'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        fast:   '150ms',
        base:   '250ms',
        slow:   '400ms',
        slower: '700ms',
      },
      keyframes: {
        // Existing
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Stage Gold — new animations
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float-up': {
          '0%':   { opacity: '0', transform: 'translateY(40px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0)  scale(1)' },
        },
        'shimmer-slide': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'spotlight-pulse': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%':      { opacity: '0.7', transform: 'scale(1.06)' },
        },
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'fade-in':        'fade-in 0.5s ease-out',
        'fade-in-up':     'fade-in-up 0.6s ease-out',
        'scale-in':       'scale-in 0.3s ease-out',
        'fade-up':        'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'float-up':       'float-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'shimmer-slide':  'shimmer-slide 2.4s linear infinite',
        shimmer:          'shimmer 2s infinite linear',
        'spotlight-pulse':'spotlight-pulse 4s ease-in-out infinite',
        'spin-slow':      'spin-slow 8s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
