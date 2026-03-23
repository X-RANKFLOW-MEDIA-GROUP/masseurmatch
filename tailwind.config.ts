import type { Config } from "tailwindcss";
import tailwindcssForms from "@tailwindcss/forms";
import tailwindcssAnimate from "tailwindcss-animate";

const withOpacity = (variableName: string) => `rgb(var(${variableName}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/_components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/mm/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        heading: ["var(--font-space)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      theme: {
        extend: {
          colors: {
            // ...existing code...
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
          },
          animation: {
            "accordion-down": "accordion-down 0.2s ease-out",
            "accordion-up": "accordion-up 0.2s ease-out",
            blob: "blob 7s infinite",
          },
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
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
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem",
      },
      boxShadow: {
        soft: "var(--shadow-subtle)",
        brand: "var(--shadow-card)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssForms, tailwindcssAnimate],
};

export default config;
