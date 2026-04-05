/**
 * Palette allineata a colors (Expo/RN): testo #2D1B24 / #664D56, primary #4D0D27, accent vinaccia.
 * Headings: Newsreader · body: Manrope
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
        /** Brand / CTA — colors.primary */
        wine: {
          900: '#4D0D27',
          800: '#3A0A1D',
          700: '#631535',
          600: '#852B4D',
        },
        /** Alias semantici (opzionale in classi: bg-primary, text-primary-muted) */
        primary: {
          DEFAULT: '#4D0D27',
          hover: '#3A0A1D',
          muted: '#664D56',
        },
        fig: {
          border: '#d5cfc4',
          input: '#f0ede4',
          body: '#2D1B24',
          bezel: '#2b1e16',
        },
        footer: '#E5E5E5',
        /** Text Primary / Text Secondary */
        body: {
          DEFAULT: '#2D1B24',
          muted: '#664D56',
        },
        /** Accenti vinaccia (ex rosa-mauve) */
        accent: {
          DEFAULT: '#E8CDD6',
          active: '#CEA0B3',
          focus: '#852B4D',
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
