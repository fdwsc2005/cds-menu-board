/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-green': '#1a2e1a',
        'gold': '#c9a84c',
        'cream': '#f5f0e8',
        'dark-ink': '#0f1a0f',
      },
    },
  },
  plugins: [],
}

