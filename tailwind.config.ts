import type { Config } from 'tailwindcss'

export default {
    content: [
        "./index.html",
        "./components/**/*.{ts,tsx}",
        "./App.tsx",
        "./index.tsx",
    ],
    theme: {
        extend: {
            colors: {
                'theme-bg': 'var(--bg-main)',
                'theme-panel': 'var(--bg-panel)',
                'theme-accent': 'var(--accent)',
                'theme-accent-hover': 'var(--accent-hover)',
                'theme-accent-glow': 'var(--accent-glow)',
                'theme-text-accent': 'var(--text-accent)',
                'theme-border': 'var(--panel-border)',
                'primary-dark': '#180404',
                'secondary-dark': '#2c0a0a',
                'accent-orange': '#ea580c',
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
} satisfies Config
