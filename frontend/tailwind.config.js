

/** @type {import('tailwindcss').Config} */

// Folora brand palette. These hex values mirror the CSS variables defined
// in src/index.css :root (kept in sync manually so Tailwind can use them
// for utility classes and opacity modifiers).
const brand = {
  primary: '#233A2E',        // Forest Green
  primaryHover: '#1B2E24',   // Primary Hover
  accent: '#C8A879',         // Sand
  accentHover: '#B89564',    // Accent Hover
  text: '#292B29',           // Charcoal
  background: '#F7F5EF',     // Warm Paper
  surface: '#FFFFFF',        // White
  muted: '#657365',          // Muted Green
  border: '#DCD9D0',         // Border
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'ui-serif', '"Times New Roman"', 'serif'],
      },
      colors: {
        // ---- Folora semantic tokens ----
        primary: {
          DEFAULT: brand.primary,
          hover: brand.primaryHover,
        },
        accent: {
          DEFAULT: brand.accent,
          hover: brand.accentHover,
          soft: '#F0E9DC',
          ink: '#7A6134',
        },
        ink: {
          DEFAULT: brand.text,
          soft: '#4B4E4B',
          mute: brand.muted,
        },
        muted: brand.muted,
        line: brand.border,
        surface: brand.surface,
        canvas: brand.background,
        paper: brand.background,

        // ---- Neutral ramp re-tinted towards charcoal / muted green ----
        // so every existing `text-neutral-*` / `bg-neutral-*` utility keeps
        // working but reads as part of the Folora palette.
        neutral: {
          50: '#FAF9F5',
          100: '#F2F0E8',
          200: brand.border,
          300: '#CBC8BB',
          400: '#9AA096',
          500: brand.muted,
          600: '#5B655B',
          700: '#3F433E',
          800: brand.text,
          900: '#20221F',
          950: '#161815',
        },
        // ---- Warm stone tones (borders / rings) ----
        stone: {
          50: '#FAF9F5',
          100: '#F2F0E8',
          200: brand.border,
          300: '#CBC8BB',
          400: '#9AA096',
          500: brand.muted,
          600: '#5B655B',
          700: '#3F433E',
          800: brand.text,
          900: '#20221F',
        },
      },
      maxWidth: {
        'reader': '42rem',
      },
      backgroundImage: {
        // Folora avoids loud gradients - only the soft paper/sand wash is kept
        "editor-grad": "linear-gradient(90deg, #F7F5EF 0%, #F0E9DC 100%)",
      },
      boxShadow: {
        "myshad": "0 1px 2px 0 rgba(41,43,41,0.04), 0 6px 18px -12px rgba(41,43,41,0.10)",
        "card": "0 1px 2px 0 rgba(41,43,41,0.04)",
        "card-hover": "0 8px 24px -14px rgba(41,43,41,0.16)",
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': brand.text,
            '--tw-prose-headings': brand.text,
            '--tw-prose-links': brand.primary,
            '--tw-prose-bold': brand.text,
            '--tw-prose-quotes': brand.text,
            '--tw-prose-quote-borders': brand.border,
            '--tw-prose-hr': brand.border,
            '--tw-prose-bullets': brand.accent,
            '--tw-prose-counters': brand.muted,
            '--tw-prose-captions': brand.muted,
            '--tw-prose-code': brand.primary,
            '--tw-prose-pre-bg': '#20221F',
            a: {
              textDecorationColor: brand.accent,
            },
            p: {
              marginTop: "0.2rem",
              marginBottom: "0.2rem",
              fontSize: "0.95rem",

              "@media (min-width: 1024px)": {
                fontSize: "1.1rem", // Even larger font size for screens above 768px
              },
            },
            h2: {
              fontSize: "1.5rem",
              marginTop: "0.5rem",
              marginBottom: "0.5rem",
              lineHeight: "1.333",
            },
            h3: {
              fontSize: "1.25rem",
              marginTop: "0.5rem",
              marginBottom: "0.5rem",
              lineHeight: "1.6",
            },
            pre: {
              fontSize: "0.7em", // 14px / 16px
              lineHeight: "1.714", // 24 / 14
              marginTop: "0em", // 24px / 14px
              marginBottom: "0.5em", // 24px / 14px
              borderRadius: "0.375rem", // 6px / 16px
              paddingTop: "0.857em", // 12px / 14px
              paddingInlineEnd: "1.143em", // 16px / 14px
              paddingBottom: "0.857em", // 12px / 14px
              paddingInlineStart: "1.143em", // 14px / 16px
            },
            hr: {
              marginTop: "0.5rem",
              marginBottom: "0.2rem",
            },
          }
        }
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
