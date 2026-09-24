import type { Config } from "tailwindcss";

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: token("paper"), deep: token("paper-deep") },
        surface: token("surface"),
        ink: { DEFAULT: token("ink"), soft: token("ink-soft") },
        ash: token("ash"),
        fog: token("fog"),
        mist: token("mist"),
        steel: {
          DEFAULT: token("steel"),
          deep: token("steel-deep"),
          light: token("steel-light"),
          wash: token("steel-wash"),
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        pixel: ["var(--font-pixel)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        retro: "4px 4px 0 0 rgb(var(--ink))",
        "retro-sm": "2px 2px 0 0 rgb(var(--ink))",
        "retro-lg": "8px 8px 0 0 rgb(var(--ink))",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        notif: {
          from: { opacity: "0", transform: "translateY(-14px) scale(0.96)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        marquee: "marquee 45s linear infinite",
        blink: "blink 1.1s steps(1) infinite",
        notif: "notif 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
