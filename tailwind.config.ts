import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        'courier-prime': ['var(--font-courier-prime)', 'monospace'],
      },
      animation: {
        heartbeat: "heartbeat 1s ease-in-out infinite",
      },
      keyframes: {
        heartbeat: {
          "0%": {
            transform: "scale(1)",
          },
          "10%": {
            transform: "scale(1.4)",
          },
          "20%": {
            transform: "scale(1)",
          },
          "30%": {
            transform: "scale(1.4)",
          },
          "40%": {
            transform: "scale(1)",
          },
          "100%": {
            transform: "scale(1)",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;