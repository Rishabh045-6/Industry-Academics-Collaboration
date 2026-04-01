import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E3A8A",
        secondary: "#3B82F6",
        accent: "#14B8A6",
        success: "#22C55E",
        purple: "#8B5CF6",
        background: "#F8FAFC",
        surface: "#ffffff",
        ink: "#0f172a",
        surf: "#f8fafc",
        ember: "#2563eb",
        pine: "#1d4ed8",
        gold: "#60a5fa",
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      boxShadow: {
        panel: "0 4px 12px rgba(0, 0, 0, 0.05)",
        soft: "0 2px 8px rgba(0, 0, 0, 0.05)",
        deep: "0 24px 60px rgba(30, 58, 138, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
