module.exports = {
    darkMode: 'class',
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                bg: "rgb(var(--color-bg) / <alpha-value>)",
                surface: "rgb(var(--color-surface) / <alpha-value>)",
                text: "rgb(var(--color-text) / <alpha-value>)",
                muted: "rgb(var(--color-muted) / <alpha-value>)",
                border: "rgb(var(--color-border) / <alpha-value>)",
                primary: "rgb(var(--color-primary) / <alpha-value>)",
                accent: "rgb(var(--color-accent) / <alpha-value>)",
                sidebar: "rgb(var(--color-sidebar) / <alpha-value>)",
                "sidebar-muted": "rgb(var(--color-sidebar-muted) / <alpha-value>)",
                "sidebar-hover": "rgb(var(--color-sidebar-hover) / <alpha-value>)",
                "sidebar-active": "rgb(var(--color-sidebar-active) / <alpha-value>)",
            },
        },
    },
    plugins: [require('@tailwindcss/line-clamp')],
}
