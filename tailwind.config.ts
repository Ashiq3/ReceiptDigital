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
            },
            colors: {
                "primary": {
                    DEFAULT: "#0D47A1"
                },
                "background-light": "#f6f8f6",
                "background-dark": "#102216",
                "text-light": "#212121",
                "text-dark": "#E0E0E0",
                "field-light": "#F1F3F4",
                "field-dark": "#2a3a2e",
            },
        },
    },
    plugins: [],
};
export default config;
