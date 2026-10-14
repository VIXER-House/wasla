import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.25rem", screens: { "2xl": "1200px" } },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      colors: {
        brand: { 50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0", 400: "#34d399", 500: "#10b981", 600: "#059669", 700: "#047857", 800: "#065f46", 900: "#064e3b", 950: "#022c22" },
        ink: { 50: "#f7f8f9", 100: "#eef0f2", 200: "#dde1e5", 300: "#c3c9d0", 400: "#8d96a1", 500: "#66707c", 600: "#4b545f", 700: "#363d46", 800: "#22282f", 900: "#14181d", 950: "#0b0e11" },
      },
      borderRadius: { xl: "0.9rem", "2xl": "1.25rem" },
    },
  },
  plugins: [],
};
export default config;
