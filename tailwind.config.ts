import type { Config } from "tailwindcss";
import tailwindcssForms from "@tailwindcss/forms";
import tailwindcssAnimate from "tailwindcss-animate";

const withOpacity = (variableName: string) => `rgb(var(${variableName}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/_components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: {
          DEFAULT: "hsl(var(--border))",
          subtle: withOpacity("--color-border-subtle-rgb"),
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        brand: {
          primary: withOpacity("--color-brand-primary-rgb"),
          deep: withOpacity("--color-brand-deep-navy-rgb"),
          secondary: withOpacity("--color-brand-secondary-rgb"),
          electric: withOpacity("--color-brand-electric-rgb"),
          accent: withOpacity("--color-brand-accent-rgb"),
          soft: withOpacity("--color-brand-soft-accent-rgb"),
          gold: withOpacity("--color-brand-gold-rgb"),
        },
        bg: {
          body: withOpacity("--color-bg-body-rgb"),
          surface: withOpacity("--color-bg-surface-rgb"),
          subtle: withOpacity("--color-bg-subtle-rgb"),
          primary: withOpacity("--color-background-primary-rgb"),
        },
        text: {
          primary: withOpacity("--color-text-primary-rgb"),
          secondary: withOpacity("--color-text-secondary-rgb"),
          muted: withOpacity("--color-text-muted-rgb"),
          inverse: withOpacity("--color-text-inverse-rgb"),
        },
        action: {
          primary: withOpacity("--color-action-primary-rgb"),
          "primary-hover": withOpacity("--color-action-primary-hover-rgb"),
          secondary: withOpacity("--color-action-secondary-rgb"),
          "secondary-hover": withOpacity("--color-action-secondary-hover-rgb"),
        },
        feedback: {
          success: withOpacity("--color-feedback-success-rgb"),
          error: withOpacity("--color-feedback-error-rgb"),
          warning: withOpacity("--color-feedback-warning-rgb"),
        },
      },
      fontFamily: {
        sans: ["Satoshi", "system-ui", "sans-serif"],
        heading: ["Satoshi", "system-ui", "sans-serif"],
        display: ["Satoshi", "system-ui", "sans-serif"],
        stat: ["Satoshi", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Roboto Mono", "Consolas", "monospace"],
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem",
      },
      boxShadow: {
        soft: "var(--shadow-subtle)",
        brand: "var(--shadow-card)",
      },
      transitionTimingFunction: {
        "smooth-out": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        600: "600ms",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        blob: {
          '0%': { transform: 'translateY(0px) scale(1)' },
          '33%': { transform: 'translateY(-20px) scale(1.08)' },
          '66%': { transform: 'translateY(10px) scale(0.98)' },
          '100%': { transform: 'translateY(0px) scale(1)' },
        },
        "aurora-1": {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)', opacity: '0.5' },
          '25%': { transform: 'translate(5%, 10%) scale(1.1)', opacity: '0.7' },
          '50%': { transform: 'translate(-5%, 5%) scale(0.95)', opacity: '0.6' },
          '75%': { transform: 'translate(10%, -5%) scale(1.05)', opacity: '0.55' },
        },
        "aurora-2": {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)', opacity: '0.5' },
          '25%': { transform: 'translate(-10%, 5%) scale(1.05)', opacity: '0.6' },
          '50%': { transform: 'translate(5%, 10%) scale(1.1)', opacity: '0.7' },
          '75%': { transform: 'translate(-5%, -10%) scale(0.95)', opacity: '0.55' },
        },
        "aurora-3": {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)', opacity: '0.5' },
          '25%': { transform: 'translate(10%, -5%) scale(0.95)', opacity: '0.55' },
          '50%': { transform: 'translate(-10%, -10%) scale(1.05)', opacity: '0.65' },
          '75%': { transform: 'translate(5%, 10%) scale(1.1)', opacity: '0.6' },
        },
        "aurora-4": {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)', opacity: '0.5' },
          '25%': { transform: 'translate(-5%, -10%) scale(1.1)', opacity: '0.7' },
          '50%': { transform: 'translate(10%, 5%) scale(0.95)', opacity: '0.55' },
          '75%': { transform: 'translate(-10%, 10%) scale(1.05)', opacity: '0.6' },
        },
        "aurora-5": {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0.3' },
          '33%': { transform: 'translate(-45%, -55%) scale(1.15)', opacity: '0.5' },
          '66%': { transform: 'translate(-55%, -45%) scale(0.9)', opacity: '0.35' },
        },
        "knotty-pulse": {
          '0%, 80%, 100%': { opacity: '0.3', transform: 'scale(0.85)' },
          '40%': { opacity: '1', transform: 'scale(1.1)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        blob: "blob 7s infinite",
        "aurora-1": "aurora-1 15s ease-in-out infinite",
        "aurora-2": "aurora-2 18s ease-in-out infinite",
        "aurora-3": "aurora-3 20s ease-in-out infinite",
        "aurora-4": "aurora-4 22s ease-in-out infinite",
        "aurora-5": "aurora-5 25s ease-in-out infinite",
        "knotty-pulse": "knotty-pulse 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssForms, tailwindcssAnimate],
};

export default config;
