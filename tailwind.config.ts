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
        album: {
          bg: "#FAF8F5",
          surface: "#FFFFFF",
          muted: "#F4F1EB",
          border: "#E8E4DC",
          "border-light": "#F2EFE9",
          ink: "#1C1A17",
          "ink-muted": "#6E6960",
          "ink-faint": "#9B958A",
          button: "#282521",
          "button-hover": "#3D3832",
        },
      },
      fontFamily: {
        serif: [
          '"Newsreader"',
          '"Cormorant Garamond"',
          '"Playfair Display"',
          'Georgia',
          'Cambria',
          '"Times New Roman"',
          'Times',
          'serif',
        ],
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        photo: "0 1px 3px rgba(30, 26, 20, 0.05), 0 4px 12px rgba(30, 26, 20, 0.03)",
        "photo-hover": "0 2px 6px rgba(30, 26, 20, 0.08), 0 8px 24px rgba(30, 26, 20, 0.06)",
        card: "0 1px 2px rgba(30, 26, 20, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
