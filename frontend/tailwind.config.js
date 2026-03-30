/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#1e1e2e',
        'bg-secondary': '#181825',
        'surface': '#2b2c3f',
        'surface-soft': '#313244',
        'highlight': '#45475a',
        'text-primary': '#cdd6f4',
        'text-secondary': '#a6adc8',
        'text-muted': '#6c7086',
        'accent-blue': '#89b4fa',
        'accent-mauve': '#cba6f7',
        'accent-green': '#a6e3a1',
        'accent-yellow': '#f9e2af',
        'accent-red': '#f38ba8',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
      },
      transitionDuration: {
        'fast': '150ms',
      },
    },
  },
  plugins: [],
}
