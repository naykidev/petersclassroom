/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand pink accent. `brand` is the filled color that carries white text
        // and hits WCAG AA >= 4.5:1 on its surface (light 184,36,98 / dark 199,51,115).
        brand: {
          DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
          fg: 'rgb(var(--brand-fg) / <alpha-value>)',
          tint: 'rgb(var(--brand) / 0.15)', // soft ~15% tint for chips/badges/cards
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
      spacing: {
        // Explicit scale: 4 / 8 / 12 / 16 / 24 / 32
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
      },
      borderRadius: {
        chip: '10px',
        btn: '14px',
        card: '16px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06)',
        elevated: '0 4px 10px rgba(0,0,0,0.10)',
        'brand-glow': '0 4px 8px rgb(var(--brand) / 0.35)',
      },
      fontSize: {
        // title-2 for hero/stat numbers, bold by default
        'title-2': ['28px', { lineHeight: '34px', fontWeight: '700' }],
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
