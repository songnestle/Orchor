import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Retro pixel palette — "aged game cartridge" warm tones.
        // Semantic token names kept so existing components re-theme for free.
        bg: "#161310",       // deep warm charcoal
        bg2: "#201c17",      // interior
        panel: "#2b251d",    // raised panel
        panel2: "#332c22",
        border: "#443c30",
        borderSoft: "#332c22",
        accent: "#d6a44c",   // aged brass (was violet)
        accent2: "#7a9450",  // sage moss (was cyan)
        accent3: "#bf5b4b",  // faded terracotta (was pink)
        muted: "#9d9078",
        mutedHi: "#c5b79a",
      },
      fontFamily: {
        sans: ["var(--nf-body)", "'DM Sans'", "Inter", "ui-sans-serif", "system-ui", "-apple-system"],
        display: ["var(--nf-display)", "'Space Grotesk'", "Inter", "ui-sans-serif", "system-ui"],
        pixel: ["var(--nf-pixel)", "'Press Start 2P'", "monospace"],
        retro: ["var(--nf-retro)", "'VT323'", "monospace"],
        mono: ["var(--nf-mono)", "'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        // hard, offset pixel shadows (no blur) — the "sticker lift" look
        glow: "4px 4px 0 0 rgba(0,0,0,0.45)",
        glowCyan: "4px 4px 0 0 rgba(0,0,0,0.45)",
        soft: "0 0 0 3px rgba(0,0,0,0.35), 4px 4px 0 0 rgba(0,0,0,0.35)",
        pixel: "4px 4px 0 0 rgba(0,0,0,0.5)",
        pixelLg: "6px 6px 0 0 rgba(0,0,0,0.5)",
        cardDeep:
          "0 0 0 3px rgba(0,0,0,0.5), 8px 8px 0 0 rgba(0,0,0,0.45)",
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
