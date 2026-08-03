import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 黑金凭证：整站只有三个色族
        bg: "#0a0906",
        bg2: "#0f0e0a",
        panel: "#111009",
        panel2: "#16150e",
        border: "#232017",
        borderSoft: "#1c1a14",
        accent: "#c6a96c",     // 香槟金 —— 稀缺资源，别铺开用
        accent2: "#8fae7a",    // 上行
        accent3: "#a8705f",    // 下行
        muted: "#6a6353",
        mutedHi: "#8a8271",
        ink: "#ede7d8",
      },
      fontFamily: {
        sans: ["var(--nf-body)", "'DM Sans'", "ui-sans-serif", "system-ui"],
        mono: ["var(--nf-mono)", "'JetBrains Mono'", "ui-monospace", "monospace"],
        serif: ["Georgia", "'Songti SC'", "'Noto Serif SC'", "serif"],
        // 旧别名保留，避免遗留 class 崩掉
        display: ["Georgia", "'Songti SC'", "serif"],
        pixel: ["Georgia", "'Songti SC'", "serif"],
        retro: ["Georgia", "'Songti SC'", "serif"],
      },
      boxShadow: {
        // 一律无阴影 —— 发丝线代替投影
        glow: "none", glowCyan: "none", soft: "none",
        pixel: "none", pixelLg: "none", cardDeep: "none",
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
