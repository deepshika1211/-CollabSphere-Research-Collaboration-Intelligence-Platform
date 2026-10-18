/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#080809',
        'background-secondary': '#0c0c0e',
        panel: '#101012',
        'panel-secondary': '#141416',
        'surface-hover': '#19191d',
        'surface-selected': '#202024',
        border: '#29292e',
        'border-subtle': '#202024',
        'text-primary': '#fafafa',
        'text-secondary': '#d4d4d8',
        'text-muted': '#85858f',
        'graph-cyan': '#70e8f5',
        'graph-cyan-bright': '#b5f5ff',
        'graph-line': '#54cfea',
        'graph-selected': '#36bde8',
        'accent-secondary': '#8585ff',
        success: '#56d6a0',
        warning: '#e9bd69',
        error: '#ef7777',
      },
      boxShadow: {
        'cyan-glow': '0 0 14px rgba(112, 232, 245, 0.35)',
        'cyan-glow-sm': '0 0 8px rgba(112, 232, 245, 0.25)',
      }
    },
  },
  plugins: [],
}
