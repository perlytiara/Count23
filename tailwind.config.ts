import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0a0f1e",
          800: "#111827",
          700: "#1e293b",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      animation: {
        "pulse-glow": "pulse-glow 1s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { filter: "drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))" },
          "50%": { filter: "drop-shadow(0 0 20px rgba(239, 68, 68, 0.9))" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
