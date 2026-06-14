/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-soft": "var(--bg-soft)",
        panel: "var(--panel)",
        "panel-2": "var(--panel-2)",
        line: "var(--line)",
        "line-2": "var(--line-2)",
        ink: {
          DEFAULT: "var(--ink)",
          dim: "var(--ink-2)",
          faint: "var(--ink-3)",
        },
        signal: {
          DEFAULT: "var(--signal)",
          press: "var(--signal-press)",
          soft: "var(--signal-soft)",
        },
        success: "var(--success)",
        warn: "var(--warn)",
        danger: "var(--danger)",
        info: "var(--info)",
      },
      fontFamily: {
        sans: ['"Hanken Grotesque"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Bricolage Grotesque"', '"Hanken Grotesque"', "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderColor: {
        DEFAULT: "var(--line)",
      },
      letterSpacing: {
        tightest: "-0.03em",
      },
      boxShadow: {
        panel:
          "inset 0 1px 0 0 rgba(255,255,255,0.04), 0 14px 40px -22px rgba(0,0,0,0.85)",
        lift: "0 24px 60px -28px rgba(0,0,0,0.9)",
        glow: "0 0 0 1px var(--signal), 0 0 28px -4px var(--signal-glow)",
        "glow-soft": "0 0 24px -6px var(--signal-glow)",
      },
      backgroundImage: {
        "signal-grad":
          "linear-gradient(135deg, var(--signal) 0%, #8fdc2e 100%)",
        "panel-sheen":
          "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0) 40%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        sheen: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(220%)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 var(--signal-glow)" },
          "70%": { boxShadow: "0 0 0 10px rgba(0,0,0,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(0,0,0,0)" },
        },
        "blink": {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.2" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.2,0.7,0.2,1) both",
        "fade-in": "fade-in 0.6s ease both",
        sheen: "sheen 1.1s cubic-bezier(0.2,0.7,0.2,1)",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite",
        blink: "blink 1.4s steps(2, start) infinite",
      },
    },
  },
  plugins: [],
};
