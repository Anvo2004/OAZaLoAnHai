/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'blob-a': {
          '0%, 100%': { transform: 'translate(-8%, -6%) scale(1)' },
          '50%':      { transform: 'translate(10%, 8%) scale(1.16)' },
        },
        'blob-b': {
          '0%, 100%': { transform: 'translate(6%, 4%) scale(1.1)' },
          '50%':      { transform: 'translate(-10%, -8%) scale(0.92)' },
        },
        'blob-c': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%':      { transform: 'translate(-6%, 8%) scale(1.14)' },
        },
        sheen: {
          '0%':   { transform: 'translateX(-140%) skewX(-18deg)' },
          '100%': { transform: 'translateX(240%) skewX(-18deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease both',
        'blob-a': 'blob-a 22s ease-in-out infinite',
        'blob-b': 'blob-b 26s ease-in-out infinite',
        'blob-c': 'blob-c 30s ease-in-out infinite',
        sheen: 'sheen 3.6s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
