import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#05050d",
        bg2: "#08081a",
        panel: "#0c0c1f",
        panel2: "#11112a",
        border: "#1c1c36",
        borderSoft: "#15152b",
        accent: "#8b5cf6",
        accent2: "#22d3ee",
        accent3: "#f472b6",
        muted: "#7a7a95",
        mutedHi: "#9a9ab5",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system"],
        display: ["'Space Grotesk'", "Inter", "ui-sans-serif", "system-ui"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(139,92,246,0.25), 0 12px 40px -12px rgba(139,92,246,0.45)",
        glowCyan: "0 0 0 1px rgba(34,211,238,0.30), 0 12px 40px -12px rgba(34,211,238,0.45)",
        soft: "0 0 0 1px rgba(255,255,255,0.04), 0 12px 36px -16px rgba(0,0,0,0.6)",
        cardDeep:
          "0 30px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(139,92,246,0.0)" },
          "50%": { boxShadow: "0 0 24px 4px rgba(139,92,246,0.35)" },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        holoSheen: {
          "0%": { transform: "translateX(-120%) skewX(-12deg)" },
          "100%": { transform: "translateX(120%) skewX(-12deg)" },
        },
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.2s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
        glowPulse: "glowPulse 1.8s ease-in-out infinite",
        floatY: "floatY 5s ease-in-out infinite",
        gradientShift: "gradientShift 8s ease-in-out infinite",
        holoSheen: "holoSheen 3.4s ease-in-out infinite",
        spinSlow: "spinSlow 14s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
