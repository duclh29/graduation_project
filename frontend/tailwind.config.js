/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#f7f1e8",
        ink: "#1f2937",
        terracotta: "#c96b3b",
        forest: "#35594a",
        mist: "#e6e8eb",
        // ── Brand palette ──
        brand: {
          DEFAULT: "#E32A15",
          dark:    "#b31f0e",
          deeper:  "#7a1509",
          light:   "#f5472e",
          pale:    "#fff3f2",
        },
      },
      boxShadow: {
        card: "0 18px 40px rgba(31, 41, 55, 0.08)",
        brand: "0 4px 24px rgba(227, 42, 21, 0.35)",
      }
    }
  },
  plugins: []
};
