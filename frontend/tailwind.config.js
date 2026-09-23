/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["Inter", "sans-serif"],
        script: ["'Friday Market'", "'Marck Script'", "'Playfair Display'", "cursive", "serif"],
      },
      colors: {
        background: "#F8FAFC",
        surface: "#FFFFFF",
        "surface-card": "#FFFFFF",
        "surface-hover": "#F1F5F9",
        border: "#E2E8F0",
        "border-subtle": "#F1F5F9",
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          light: "#DBEAFE",
          subtle: "#EFF6FF",
        },
        accent: {
          cyan: "#0891B2",
          emerald: "#059669",
          amber: "#D97706",
          purple: "#7C3AED",
          indigo: "#4F46E5",
          rose: "#E11D48",
        },
        foreground: {
          DEFAULT: "#0F172A",
          muted: "#475569",
          subtle: "#94A3B8",
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        "card-hover": "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05)",
        float: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};

