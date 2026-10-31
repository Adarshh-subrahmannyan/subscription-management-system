import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#D7191C",
          50:  "#fff0f0",
          100: "#ffd9d9",
          200: "#ffb3b3",
          300: "#ff8080",
          400: "#ff4d4d",
          500: "#D7191C",
          600: "#b31418",
          700: "#8f1013",
          800: "#6b0c0e",
          900: "#470809",
        },
        accent: {
          blue:  "#4778F5",
          green: "#16a34a",
          amber: "#d97706",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted:   "#F3F3F6",
          hover:   "#F8F8FB",
        },
        ink: {
          DEFAULT: "#111827",
          muted:   "#8B9098",
          faint:   "#C4C8CF",
        },
        border: {
          DEFAULT: "#ECEEF1",
          strong:  "#D1D5DB",
        },
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "3xl": "1.5rem",
        "2xl": "1.125rem",
      },
      boxShadow: {
        card: "0 2px 16px rgba(17, 24, 39, 0.06)",
        "card-md": "0 4px 24px rgba(17, 24, 39, 0.10)",
        brand: "0 4px 16px rgba(215, 25, 28, 0.25)",
      },
      keyframes: {
        "slide-in-left": {
          from: { transform: "translateX(-100%)", opacity: "0" },
          to:   { transform: "translateX(0)",    opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "slide-in-left": "slide-in-left 0.22s ease-out",
        "fade-in":       "fade-in 0.18s ease-out",
        "scale-in":      "scale-in 0.15s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
