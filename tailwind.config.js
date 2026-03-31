/**
 * Design tokens from Figma App-Vini, frame node 636:537 (MCP get_design_context).
 * Headings: Newsreader · UI/body: Manrope · Page #F5F1E9 · Primary #6e4f32 · Body #4e3b31 · Surfaces #e4d9ca / inputs #f0ede4 · Borders #d5cfc4 · Bezel #2b1e16
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        page: '#F5F1E9',
        cream: {
          DEFAULT: '#FAF9F6',
          muted: '#F3F1EC',
        },
        surface: '#e4d9ca',
        wine: {
          900: '#6e4f32',
          800: '#5d432a',
          700: '#634832',
          600: '#7a5a45',
        },
        fig: {
          border: '#d5cfc4',
          input: '#f0ede4',
          body: '#4e3b31',
          bezel: '#2b1e16',
        },
        footer: '#E5E5E5',
        body: {
          DEFAULT: '#4e3b31',
          muted: '#635f5b',
        },
      },
      fontFamily: {
        serif: ['"Newsreader"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-sm': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        display: ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '-0.02em' }],
        'display-lg': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
        'fig-h2': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      spacing: {
        section: '4rem',
        'section-lg': '6rem',
      },
      maxWidth: {
        landing: '72rem',
        content: '42rem',
        hero: '56rem',
      },
      borderRadius: {
        figma: '0.375rem',
        phone: '3rem',
        card: '1rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0, 0, 0, 0.05)',
        phone: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overlay: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
  },
  plugins: [],
}
