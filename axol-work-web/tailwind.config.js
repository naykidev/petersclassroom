/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand coral. `brand` fills with white text and hits WCAG AA >= 4.5:1.
        brand: {
          DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
          fg: 'rgb(var(--brand-fg) / <alpha-value>)',
          deep: 'rgb(var(--brand-deep) / <alpha-value>)',
          tint: 'rgb(var(--brand) / 0.12)',
        },
        // Neutral surface tokens (CSS-variable backed for light/dark).
        page: 'rgb(var(--page) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        'fg-muted': 'rgb(var(--fg-muted) / <alpha-value>)',
        // Status colors (always paired with text/icon, never color-alone).
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        info: 'rgb(var(--info) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        ui: ['var(--a11y-font)'],
      },
      spacing: {
        // Explicit scale: 4 / 8 / 12 / 16 / 24 / 32
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
      },
      // Radii aligned with homepage (--r / --r-lg / --r-xl ≈ 4–8px)
      borderRadius: {
        chip: '6px',
        btn: '8px',
        card: '8px',
      },
      boxShadow: {
        // Homepage design system is intentionally flat (no glow).
        card: 'none',
        elevated: 'none',
        'brand-glow': 'none',
      },
      fontSize: {
        // title-2 for page h1 — Arvo via font-display where applied
        'title-2': ['28px', { lineHeight: '34px', fontWeight: '700', letterSpacing: '-0.02em' }],
        headline: ['17px', { lineHeight: '22px', fontWeight: '600' }],
        caption: ['12px', { lineHeight: '16px' }],
      },
      minHeight: {
        touch: '44px', // WCAG AA >= 44px hit target
      },
      minWidth: {
        touch: '44px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'scale-in': 'scale-in 150ms ease-out',
      },
    },
  },
  plugins: [],
}
