/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0f",
        card: "rgba(255,255,255,0.03)",
        border: "rgba(255,255,255,0.07)",
        green: "#10b981",
        purple: "#6366f1",
        yellow: "#f59e0b",
        red: "#ef4444",
      },
    },
  },
  plugins: [],
}