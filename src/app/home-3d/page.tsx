import type { Metadata } from "next";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Handshake,
  Layers,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Home 3D Test — Premium Brand Showcase | MasseurMatch",
  description:
    "Test homepage exploring the MasseurMatch premium 3D brand identity: brushed titanium and metallic wine on white.",
  robots: { index: false, follow: false },
};

/* ── Brand constants (from the 3D identity board) ──────────────────── */

const INK = "#0D0D0F";
const GUNMETAL = "#2A2A2D";
const TITANIUM = "#D1D1D1";
const WINE = "#8B1E2D";

const TITANIUM_TEXT =
  "linear-gradient(105deg, #F4F4F5 0%, #C7C7CA 28%, #8F8F94 48%, #E4E4E6 66%, #77777B 88%, #B9B9BC 100%)";
const WINE_TEXT =
  "linear-gradient(105deg, #C05663 0%, #8B1E2D 38%, #5E121E 62%, #A83848 84%, #7A1826 100%)";

/* ── 3D monogram: two interlocked extruded M's ─────────────────────── */

function Monogram3D({
  size = 320,
  depth = 8,
}: {
  size?: number;
  depth?: number;
}) {
  const steps = Array.from({ length: depth }, (_, i) => i + 1);
  return (
    <svg
      viewBox="0 0 306 250"
      width={size}
      height={(size * 250) / 306}
      role="img"
      aria-label="MasseurMatch MM monogram"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <path
          id="mm-m"
          d="M0 150 V10 H42 L85 78 L128 10 H170 V150 H136 V68 L97 130 H73 L34 68 V150 Z"
        />
        <linearGradient id="mm-ti-face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F2F2F3" />
          <stop offset="0.32" stopColor="#C7C7CA" />
          <stop offset="0.52" stopColor="#8F8F94" />
          <stop offset="0.72" stopColor="#DCDCDE" />
          <stop offset="1" stopColor="#77777B" />
        </linearGradient>
        <linearGradient id="mm-ti-side" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4B4B4F" />
          <stop offset="1" stopColor="#232326" />
        </linearGradient>
        <linearGradient id="mm-wine-face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C05663" />
          <stop offset="0.38" stopColor="#8B1E2D" />
          <stop offset="0.64" stopColor="#5E121E" />
          <stop offset="0.85" stopColor="#A83848" />
          <stop offset="1" stopColor="#6E1521" />
        </linearGradient>
        <linearGradient id="mm-wine-side" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3F0B12" />
          <stop offset="1" stopColor="#26070B" />
        </linearGradient>
        <linearGradient id="mm-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="0.28" stopColor="#FFFFFF" stopOpacity="0.08" />
          <stop offset="0.55" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.12" />
        </linearGradient>
        <pattern
          id="mm-brush"
          width="3"
          height="3"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(26)"
        >
          <rect width="3" height="3" fill="none" />
          <line x1="0" y1="0" x2="0" y2="3" stroke="#FFFFFF" strokeOpacity="0.28" strokeWidth="0.5" />
          <line x1="1.5" y1="0" x2="1.5" y2="3" stroke="#000000" strokeOpacity="0.14" strokeWidth="0.5" />
        </pattern>
        <radialGradient id="mm-ground" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#0D0D0F" stopOpacity="0.28" />
          <stop offset="0.7" stopColor="#0D0D0F" stopOpacity="0.1" />
          <stop offset="1" stopColor="#0D0D0F" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="155" cy="238" rx="128" ry="11" fill="url(#mm-ground)" />

      {/* titanium M (back) */}
      <g transform="translate(16, 28)">
        {steps.map((i) => (
          <use
            key={i}
            href="#mm-m"
            transform={`translate(${depth - i}, ${(depth - i) * 0.9})`}
            fill="url(#mm-ti-side)"
          />
        ))}
        <use href="#mm-m" fill="url(#mm-ti-face)" />
        <use href="#mm-m" fill="url(#mm-brush)" opacity="0.5" />
        <use href="#mm-m" fill="url(#mm-gloss)" />
        <use href="#mm-m" fill="none" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="0.75" />
      </g>

      {/* metallic wine M (front, offset like the identity board) */}
      <g transform="translate(122, 64) scale(0.92)">
        {steps.map((i) => (
          <use
            key={i}
            href="#mm-m"
            transform={`translate(${depth - i}, ${(depth - i) * 0.9})`}
            fill="url(#mm-wine-side)"
          />
        ))}
        <use href="#mm-m" fill="url(#mm-wine-face)" />
        <use href="#mm-m" fill="url(#mm-brush)" opacity="0.35" />
        <use href="#mm-m" fill="url(#mm-gloss)" />
        <use href="#mm-m" fill="none" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="0.75" />
      </g>
    </svg>
  );
}

/* ── Small flat monogram for the header ────────────────────────────── */

function MonogramMark({ size = 34 }: { size?: number }) {
  return (
    <svg viewBox="0 0 306 224" width={size} height={(size * 224) / 306} aria-hidden="true">
      <defs>
        <linearGradient id="mk-ti" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D9D9DB" />
          <stop offset="0.5" stopColor="#8F8F94" />
          <stop offset="1" stopColor="#C4C4C7" />
        </linearGradient>
        <linearGradient id="mk-wine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A83848" />
          <stop offset="0.55" stopColor="#8B1E2D" />
          <stop offset="1" stopColor="#5E121E" />
        </linearGradient>
      </defs>
      <path
        d="M0 150 V10 H42 L85 78 L128 10 H170 V150 H136 V68 L97 130 H73 L34 68 V150 Z"
        transform="translate(8, 8)"
        fill="url(#mk-ti)"
      />
      <path
        d="M0 150 V10 H42 L85 78 L128 10 H170 V150 H136 V68 L97 130 H73 L34 68 V150 Z"
        transform="translate(122, 66) scale(0.88)"
        fill="url(#mk-wine)"
      />
    </svg>
  );
}

/* ── Metallic finish discs (acabamento 3D premium) ─────────────────── */

function FinishDisc({ kind }: { kind: "titanium" | "gunmetal" | "wine" | "black" }) {
  const conic: Record<string, string> = {
    titanium:
      "conic-gradient(from 215deg, #CFCFD2, #8E8E92, #EAEAEC, #77777B, #D6D6D8, #8A8A8E, #CFCFD2)",
    gunmetal:
      "conic-gradient(from 215deg, #45454A, #232326, #55555A, #1C1C1F, #3E3E43, #232326, #45454A)",
    wine:
      "conic-gradient(from 215deg, #A83848, #5E121E, #C05663, #4A0E16, #8B1E2D, #5E121E, #A83848)",
    black:
      "conic-gradient(from 215deg, #232325, #121214, #2A2A2D, #0D0D0F, #1E1E21, #121214, #232325)",
  };
  return (
    <div
      aria-hidden="true"
      className="mm3d-disc"
      style={{
        background: [
          "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.5), rgba(255,255,255,0) 45%)",
          "repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0 1px, rgba(0,0,0,0.05) 1px 2px)",
          conic[kind],
        ].join(", "),
      }}
    />
  );
}

/* ── Page ───────────────────────────────────────────────────────────── */

const finishes = [
  { kind: "titanium" as const, name: "Brushed Titanium", hex: TITANIUM },
  { kind: "gunmetal" as const, name: "Matte Gunmetal", hex: GUNMETAL },
  { kind: "wine" as const, name: "Metallic Wine", hex: WINE },
  { kind: "black" as const, name: "Matte Black", hex: INK },
];

const paletteSwatches = [
  { hex: "#0D0D0F", name: "Ink Black", light: false },
  { hex: "#2A2A2D", name: "Gunmetal", light: false },
  { hex: "#D1D1D1", name: "Titanium", light: true },
  { hex: "#8B1E2D", name: "Wine", light: false },
];

const brandElements = [
  {
    icon: Layers,
    title: "Exclusive monogram",
    body: "Two interlocking M's — strength, trust and human connection, machined into one mark.",
  },
  {
    icon: Handshake,
    title: "Human connection",
    body: "The forms join to create a link that symbolizes the professional touch between therapist and client.",
  },
  {
    icon: ShieldCheck,
    title: "Trust & safety",
    body: "A brand built to feel dependable — every profile is reviewed before going live.",
  },
  {
    icon: BadgeCheck,
    title: "Quality verification",
    body: "The wine check-mark accent stands for a curated, quality-first directory.",
  },
];

export default function Home3DTestPage() {
  return (
    <div style={{ background: "#FFFFFF", color: "#111111" }}>
      <style>{`
        .mm3d-sheen {
          background-size: 220% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        @media (prefers-reduced-motion: no-preference) {
          .mm3d-sheen {
            animation: mm3d-sheen-move 9s ease-in-out infinite alternate;
          }
          @keyframes mm3d-sheen-move {
            from { background-position: 0% 50%; }
            to { background-position: 100% 50%; }
          }
        }
        .mm3d-disc {
          width: 7rem;
          height: 7rem;
          border-radius: 9999px;
          box-shadow:
            0 22px 34px -16px rgba(13, 13, 15, 0.45),
            0 2px 6px rgba(13, 13, 15, 0.18),
            inset 0 1px 1px rgba(255, 255, 255, 0.55),
            inset 0 -2px 4px rgba(0, 0, 0, 0.35);
        }
        .mm3d-card {
          background: linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%);
          border: 1px solid #E8E8E8;
          border-radius: 1rem;
          box-shadow:
            0 1px 2px rgba(13, 13, 15, 0.05),
            0 16px 32px -20px rgba(13, 13, 15, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          transition: transform 200ms ease, box-shadow 200ms ease;
        }
        .mm3d-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 2px 4px rgba(13, 13, 15, 0.06),
            0 28px 44px -22px rgba(139, 30, 45, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }
        @media (prefers-reduced-motion: reduce) {
          .mm3d-card, .mm3d-card:hover { transition: none; transform: none; }
        }
      `}</style>

      {/* ─── Header ───────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #E8E8E8",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <MonogramMark size={36} />
            <span className="text-[1.05rem] font-black tracking-tight">
              <span style={{ color: "#111111" }}>Masseur</span>
              <span style={{ color: WINE }}>Match</span>
            </span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            {["Explore", "How it works", "For therapists"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm font-medium transition-colors"
                style={{ color: "#6F6F6F" }}
              >
                {item}
              </a>
            ))}
          </nav>
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
            style={{
              background: "linear-gradient(180deg, #A02B3B 0%, #8B1E2D 45%, #5E121E 100%)",
              boxShadow:
                "0 10px 20px -10px rgba(139,30,45,0.55), inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(0,0,0,0.3)",
            }}
          >
            Join the waitlist
            <ArrowRight strokeWidth={2.5} style={{ width: "0.95rem", height: "0.95rem" }} />
          </a>
        </div>
      </header>

      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* fine radially-masked dot grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(#111111 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            opacity: 0.07,
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 38%, black, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 38%, black, transparent 75%)",
          }}
        />
        {/* soft wine glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 46% 34% at 50% 30%, rgba(139,30,45,0.07), transparent 70%)",
          }}
        />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pb-24 pt-16 text-center sm:pt-20">
          {/* extruded 3D monogram with reflection */}
          <div className="relative">
            <Monogram3D size={300} />
            <div
              aria-hidden="true"
              style={{
                height: "5.5rem",
                overflow: "hidden",
                opacity: 0.3,
                marginTop: "-1.5rem",
                maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 85%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 85%)",
              }}
            >
              {/* flip, then pull up past the empty ground area at the SVG's base */}
              <div style={{ transform: "translateY(-2.5rem) scaleY(-1)" }}>
                <Monogram3D size={300} depth={4} />
              </div>
            </div>
          </div>

          <p
            className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: "#8E8E8E" }}
          >
            Relax · Connect · Enjoy
          </p>

          <h1
            className="mt-4 text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl"
            style={{
              filter:
                "drop-shadow(0 2px 0 rgba(255,255,255,0.9)) drop-shadow(0 14px 22px rgba(13,13,15,0.22))",
            }}
          >
            <span className="mm3d-sheen" style={{ backgroundImage: TITANIUM_TEXT }}>
              Masseur
            </span>
            <span className="mm3d-sheen" style={{ backgroundImage: WINE_TEXT }}>
              Match
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed" style={{ color: "#6F6F6F" }}>
            A premium directory of LGBTQ+-affirming male massage therapists across the US.
            Machined in brushed titanium and metallic wine — built on trust.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#"
              className="inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-base font-semibold text-white"
              style={{
                background: "linear-gradient(180deg, #A02B3B 0%, #8B1E2D 45%, #5E121E 100%)",
                boxShadow:
                  "0 18px 30px -12px rgba(139,30,45,0.55), 0 2px 4px rgba(94,18,30,0.4), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.28)",
              }}
            >
              Find a therapist
              <ArrowRight strokeWidth={2.5} style={{ width: "1.1rem", height: "1.1rem" }} />
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-base font-semibold"
              style={{
                color: "#111111",
                background: "linear-gradient(180deg, #FCFCFC 0%, #E9E9EB 55%, #D6D6D8 100%)",
                border: "1px solid #C9C9CC",
                boxShadow:
                  "0 14px 24px -14px rgba(13,13,15,0.4), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -2px 0 rgba(0,0,0,0.08)",
              }}
            >
              List your practice
              <ArrowUpRight strokeWidth={2.5} style={{ width: "1.1rem", height: "1.1rem" }} />
            </a>
          </div>
        </div>
      </section>

      {/* thin gradient hairline */}
      <div
        aria-hidden="true"
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, transparent, #D9D9D9 25%, rgba(139,30,45,0.45) 50%, #D9D9D9 75%, transparent)",
        }}
      />

      {/* ─── Premium 3D finishes ──────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20" style={{ background: "#FFFFFF" }}>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: WINE }}>
          Acabamento 3D Premium
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          Machined finishes
        </h2>
        <p className="mt-3 max-w-lg text-base leading-relaxed" style={{ color: "#6F6F6F" }}>
          The identity is rendered in four physical materials — brushed metal, matte
          coatings and a deep metallic wine.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-10 sm:grid-cols-4">
          {finishes.map((f) => (
            <div key={f.kind} className="flex flex-col items-center gap-4 text-center">
              <FinishDisc kind={f.kind} />
              <div>
                <p className="text-sm font-semibold" style={{ color: "#111111" }}>
                  {f.name}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "#8E8E8E" }}>
                  {f.hex}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Palette ──────────────────────────────────────────────── */}
      <section style={{ background: "#F7F7F7", borderTop: "1px solid #E8E8E8", borderBottom: "1px solid #E8E8E8" }}>
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: WINE }}>
            Paleta de cores
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Core palette</h2>

          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {paletteSwatches.map((s) => (
              <div key={s.hex} className="flex flex-col items-start gap-3">
                <div
                  aria-hidden="true"
                  className="h-28 w-full rounded-xl"
                  style={{
                    background: `linear-gradient(145deg, ${s.hex}, ${s.hex})`,
                    border: s.light ? "1px solid #C9C9CC" : "1px solid rgba(13,13,15,0.4)",
                    boxShadow:
                      "0 18px 28px -16px rgba(13,13,15,0.4), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -3px 6px rgba(0,0,0,0.25)",
                  }}
                />
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#111111" }}>
                    {s.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "#8E8E8E" }}>
                    {s.hex}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Brand elements ───────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: WINE }}>
          Elementos
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          What the mark stands for
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {brandElements.map((el) => (
            <div key={el.title} className="mm3d-card p-6">
              <div
                className="inline-flex items-center justify-center rounded-xl p-3"
                style={{
                  background: "linear-gradient(180deg, #F8EDEE 0%, #F2E0E2 100%)",
                  border: "1px solid rgba(139,30,45,0.18)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 6px 12px -8px rgba(139,30,45,0.35)",
                }}
              >
                <el.icon strokeWidth={2.25} style={{ width: "1.35rem", height: "1.35rem", color: WINE }} />
              </div>
              <h3 className="mt-5 text-base font-bold" style={{ color: "#111111" }}>
                {el.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "#6F6F6F" }}>
                {el.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Dark bookend / CTA band ──────────────────────────────── */}
      <footer style={{ background: `linear-gradient(180deg, ${GUNMETAL} 0%, ${INK} 60%)` }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center">
          <MonogramMark size={56} />
          <h2 className="mt-8 text-3xl font-black tracking-tight text-white sm:text-4xl">
            <span className="mm3d-sheen" style={{ backgroundImage: TITANIUM_TEXT }}>
              Relax. Connect.
            </span>{" "}
            <span className="mm3d-sheen" style={{ backgroundImage: WINE_TEXT }}>
              Enjoy.
            </span>
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed" style={{ color: "#8E8E8E" }}>
            Test page for the premium 3D brand direction — brushed titanium, metallic
            wine, white canvas.
          </p>
          <a
            href="#"
            className="mt-10 inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-base font-semibold text-white"
            style={{
              background: "linear-gradient(180deg, #A02B3B 0%, #8B1E2D 45%, #5E121E 100%)",
              boxShadow:
                "0 18px 30px -12px rgba(139,30,45,0.6), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.3)",
            }}
          >
            Get early access
            <ArrowRight strokeWidth={2.5} style={{ width: "1.1rem", height: "1.1rem" }} />
          </a>
          <p className="mt-14 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "#6F6F6F" }}>
            MasseurMatch · Brand test · Not indexed
          </p>
        </div>
      </footer>
    </div>
  );
}
