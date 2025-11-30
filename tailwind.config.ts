import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "neon-gradient": "linear-gradient(to bottom right, #0F172A, #1E1B4B)",
            },
            colors: {
                background: "#050505", // Deep black/gray
                surface: "#121212", // Slightly lighter for cards
                primary: "#3B82F6", // Electric Blue
                secondary: "#8B5CF6", // Violet
                accent: "#F472B6", // Pink
                text: {
                    main: "#E2E8F0",
                    muted: "#94A3B8",
                },
                border: "#2D3748",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
        },
    },
    plugins: [],
};
export default config;
