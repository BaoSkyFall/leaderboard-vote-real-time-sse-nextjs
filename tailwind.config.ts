import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./config/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stage / backgrounds
        background: "#0A1633",
        stage: "#0A1633",
        surface: "#06122f",
        "surface-dim": "#070F24",
        "surface-container-lowest": "#020c29",
        "surface-container-low": "#0f1a37",
        "surface-container": "#131e3c",
        "surface-container-high": "#1e2947",
        "surface-container-highest": "#293452",
        "surface-bright": "#1A2540",
        "surface-variant": "#293452",
        // On-surface text
        "on-surface": "#FFFFFF",
        "on-surface-variant": "#A8B4D0",
        // Primary (GEM blue)
        primary: "#b7c4ff",
        "primary-container": "#1452f5",
        "primary-container-dark": "#0B2A8F",
        "on-primary": "#002583",
        "on-primary-container": "#dce0ff",
        "primary-fixed": "#dde1ff",
        "primary-fixed-dim": "#b7c4ff",
        // Secondary / accent (orange)
        secondary: "#ffb68a",
        "secondary-container": "#e0731d",
        "on-secondary": "#522300",
        "on-secondary-container": "#471e00",
        accent: "#FF8A35",
        // Error
        error: "#ffb4ab",
        "error-red": "#FF4D4D",
        "error-container": "#93000a",
        // Outline
        outline: "#8d90a2",
        "outline-variant": "#434656",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        gutter: "16px",
        lg: "24px",
        xl: "32px",
        unit: "4px",
        "margin-mobile": "20px",
        "margin-desktop": "40px",
      },
      fontFamily: {
        sans: ["var(--font-hanken)", "Aptos", "Hanken Grotesk", "system-ui", "sans-serif"],
        "display-lg": ["var(--font-hanken)", "Aptos", "Hanken Grotesk", "sans-serif"],
        "headline-md": ["var(--font-hanken)", "Aptos", "Hanken Grotesk", "sans-serif"],
        "title-md": ["var(--font-hanken)", "Aptos", "Hanken Grotesk", "sans-serif"],
        "body-base": ["var(--font-hanken)", "Aptos", "Hanken Grotesk", "sans-serif"],
        "body-bold": ["var(--font-hanken)", "Aptos", "Hanken Grotesk", "sans-serif"],
        "label-caps": ["var(--font-hanken)", "Aptos", "Hanken Grotesk", "sans-serif"],
        "stat-lg": ["var(--font-hanken)", "Aptos", "Hanken Grotesk", "sans-serif"],
        "stat-lg-mobile": ["var(--font-hanken)", "Aptos", "Hanken Grotesk", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "58px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-lg-mobile": ["40px", { lineHeight: "46px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["32px", { lineHeight: "42px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-md-mobile": ["28px", { lineHeight: "36px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "title-md": ["24px", { lineHeight: "31px", letterSpacing: "0", fontWeight: "600" }],
        "title-md-mobile": ["20px", { lineHeight: "26px", letterSpacing: "0", fontWeight: "600" }],
        "body-base": ["16px", { lineHeight: "26px", letterSpacing: "0", fontWeight: "400" }],
        "body-bold": ["16px", { lineHeight: "26px", letterSpacing: "0", fontWeight: "600" }],
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.08em", fontWeight: "600" }],
        "stat-lg": ["40px", { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "stat-lg-mobile": ["32px", { lineHeight: "36px", letterSpacing: "-0.02em", fontWeight: "700" }],
      },
      keyframes: {
        ripple: {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        "pulse-soft": {
          "0%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
          "100%": { opacity: "0.4" },
        },
        "pulse-timer": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
      },
      animation: {
        ripple: "ripple 1.8s cubic-bezier(0,0.2,0.8,1) infinite",
        "pulse-soft": "pulse-soft 2s infinite ease-in-out",
        "pulse-timer": "pulse-timer 1s cubic-bezier(0.4,0,0.6,1) infinite",
        float: "float 3s ease-in-out infinite",
        shake: "shake 0.2s ease-in-out 0s 2",
      },
    },
  },
  plugins: [],
};

export default config;
