import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const withOpacity = (variableName: string) => `rgb(var(${variableName}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/mm/**/*.{ts,tsx}"],
  theme: {
    extend: {
<<<<<<< HEAD
      fontFamily: {
        display: ["var(--font-sora)", "sans-serif"],
        heading: ["var(--font-sora)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      colors: {
        border: {
          DEFAULT: "hsl(var(--border))",
          subtle: withOpacity("--color-border-subtle-rgb"),
          strong: withOpacity("--color-border-strong-rgb"),
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
=======
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        destructive: "hsl(var(--destructive))"
>>>>>>> 14f585c6ffaead32cd933636ddd3286e7124f036
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem"
      },
      boxShadow: {
<<<<<<< HEAD
        soft: "0 24px 60px rgb(11 31 58 / 0.18)",
        brand: "var(--shadow-card)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
=======
        soft: "0 20px 50px rgba(15, 23, 42, 0.08)"
>>>>>>> 14f585c6ffaead32cd933636ddd3286e7124f036
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"]
      }
    }
  },
<<<<<<< HEAD
  plugins: [tailwindcssAnimate],
} satisfies Config;
=======
  plugins: []
};

export default config;
>>>>>>> 14f585c6ffaead32cd933636ddd3286e7124f036
