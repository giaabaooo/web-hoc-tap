/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: ['Inter', 'sans-serif'],
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        md: ['16px', '24px'],
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '36px',
      },
      colors: {
        text: {
          primary: '#12325b',
          tertiary: '#5b6f8a',
          inverse: '#4b5563',
        },
        surface: {
          muted: '#ffffff',
          base: '#000000',
          raised: '#2d7cff',
          strong: '#f6faff',
        },
        border: {
          default: '#e5e7eb',
          muted: '#d9e8ff',
        }
      },
      boxShadow: {
        '1': '0px 4px 12px 0px rgba(18, 50, 91, 0.08)',
        '2': '0px 8px 24px 0px rgba(45, 124, 255, 0.1)',
        '3': '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
        '4': '0px 6px 14px 0px rgba(45, 124, 255, 0.25)',
      },
      transitionDuration: {
        instant: '150ms',
        fast: '200ms',
        normal: '300ms',
      }
    },
  },
  corePlugins: {
    // Tắt sinh class blur để tối ưu hiệu năng render (rất quan trọng)
    backdropBlur: false,
    blur: false,
  },
  plugins: [],
}