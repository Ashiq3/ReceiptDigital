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
                primary: {
                    DEFAULT: "#3079ff", // Brighter blue from dashboard
                    dark: "#0D47A1", // Deep blue from login
                },
                secondary: "#ff8c42", // Vivid orange
                background: {
                    light: "#F4F6F8",
                    dark: "#0F1113", // Deep dark background
                    DEFAULT: "#0F1113",
                },
                surface: {
                    light: "#FFFFFF",
                    dark: "#1C1E22", // Dark card background
                    DEFAULT: "#1C1E22",
                },
                field: {
                    light: "#F1F3F4",
                    dark: "#2a3a2e", // Input field background from login design
                    DEFAULT: "#2a3a2e",
                },
                text: {
                    light: "#333333",
                    dark: "#EAEAEA", // Slightly off-white
                    muted: "#9CA3AF", // Gray-400 equivalent for muted text
                    main: "#EAEAEA", // Default dark text
                },
                border: {
                    light: "#EAECEF",
                    dark: "#2D3035", // Softer border color
                    DEFAULT: "#2D3035",
                },
                // Keeping these for backward compatibility if needed, but mapped to new theme
                accent: "#ff8c42",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
                display: ["Inter", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "0.25rem",
                lg: "0.5rem",
                xl: "0.75rem",
                "2xl": "1rem",
            },
        },
    },
    plugins: [],
};
export default config;
