"use client";

import { useState } from "react";
import Image from "next/image";

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to subscribe");
      }

      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to subscribe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0f18] overflow-hidden">
      <style>{`
        @keyframes mmpulse {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.03); }
        }
        @keyframes mmfloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
        @keyframes mmfadeup {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes mmfadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes mmshimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: -200% 50%; }
        }
        @keyframes mmblink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>

      {/* Desktop Hero (hidden on mobile) */}
      <div className="hidden lg:flex min-h-screen items-center justify-center p-16">
        <div className="relative w-full max-w-6xl h-screen max-h-screen">
          {/* Background with gradients */}
          <div className="absolute inset-0 bg-[#1A1F2E] rounded-sm shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#A8304A] via-[rgba(168,48,74,0.28)] to-transparent opacity-50"
              style={{
                backgroundImage: "radial-gradient(120% 130% at 78% 18%, #A8304A 0%, rgba(168,48,74,.28) 26%, rgba(168,48,74,0) 52%), linear-gradient(150deg, #202638 0%, #1A1F2E 46%, #141826 100%)",
              }}
            ></div>
            <div className="absolute inset-0"
              style={{
                background: "radial-gradient(90% 90% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.5) 100%)",
              }}
            ></div>

            {/* Animated ripples */}
            <div
              className="absolute -top-64 -right-56"
              style={{ animation: "mmpulse 7s ease-in-out infinite" }}
            >
              <div className="relative w-96 h-96 flex items-center justify-center">
                <div className="absolute w-96 h-96 border border-white/5 rounded-full"></div>
                <div className="absolute w-72 h-72 border border-white/7 rounded-full"></div>
                <div className="absolute w-[500px] h-[500px] border border-white/9 rounded-full"></div>
                <div className="absolute w-80 h-80 border border-[#FFE0E7]/14 rounded-full"></div>
                <div className="absolute w-40 h-40 rounded-full bg-gradient-to-br from-[#c24763] to-[#8f2740] shadow-[0_0_60px_rgba(168,48,74,0.65)]"></div>
              </div>
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-between p-16">
              {/* Logo */}
              <div
                className="flex items-start"
                style={{
                  animation: "mmfadein 0.9s ease 0.05s both",
                  filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.5))",
                }}
              >
                <div className="h-14 w-auto">
                  <svg viewBox="0 0 200 100" className="h-full w-auto fill-white" xmlns="http://www.w3.org/2000/svg">
                    <text x="10" y="80" fontSize="60" fontWeight="bold" fontFamily="Space Grotesk, monospace">MM</text>
                  </svg>
                </div>
              </div>

              {/* Main content */}
              <div className="flex flex-col gap-6 max-w-2xl">
                {/* Badge */}
                <div
                  className="inline-flex items-center gap-2.5 w-fit px-4 py-2 border border-white/16 rounded-full bg-white/3"
                  style={{ animation: "mmfadeup 0.8s ease 0.15s both" }}
                >
                  <span
                    className="w-2 h-2 rounded-full bg-[#A8304A]"
                    style={{
                      boxShadow: "0 0 10px #A8304A",
                      animation: "mmblink 2.4s ease-in-out infinite",
                    }}
                  ></span>
                  <span className="text-xs font-mono font-semibold tracking-widest text-gray-300 uppercase">
                    Verified · LGBTQ+ Affirming
                  </span>
                </div>

                {/* Headline */}
                <h1
                  className="text-7xl font-bold tracking-tight text-white leading-none"
                  style={{
                    fontFamily: "Space Grotesk, monospace",
                    animation: "mmfadeup 0.9s ease 0.28s both",
                  }}
                >
                  Launching
                  <br />
                  <span
                    style={{
                      background: "linear-gradient(100deg, #fff 0%, #e8a9b6 40%, #A8304A 70%, #fff 100%)",
                      backgroundSize: "200% auto",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      animation: "mmshimmer 6s linear infinite",
                    }}
                  >
                    Soon
                  </span>
                </h1>

                {/* Tagline */}
                <p
                  className="text-2xl leading-relaxed text-gray-300 max-w-xl"
                  style={{ animation: "mmfadeup 0.9s ease 0.4s both" }}
                >
                  AI-powered verified therapist discovery — a premium directory of male massage therapists you can trust.
                </p>
              </div>

              {/* Email Form */}
              <div
                className="flex items-center gap-3"
                style={{ animation: "mmfadeup 0.9s ease 0.52s both" }}
              >
                <form onSubmit={handleSubmit} className="flex items-center flex-1">
                  <div className="flex items-center h-14 border border-white/16 rounded-full bg-white/4 px-6 overflow-hidden flex-1 max-w-xs">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="flex-1 bg-transparent text-base text-gray-400 placeholder-gray-500 outline-none"
                      required
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="ml-2 h-14 px-8 border border-white/50 rounded-full font-bold text-base tracking-wide text-white cursor-pointer transition-all"
                      style={{
                        background: "repeating-linear-gradient(90deg, rgba(255,255,255,.10) 0px, rgba(255,255,255,.10) 1px, rgba(0,0,0,.08) 2px, rgba(0,0,0,.08) 3px), linear-gradient(180deg, #d76b83 0%, #b23a54 28%, #8a2338 52%, #a83048 74%, #661726 100%)",
                        borderTopColor: "#e58197",
                        borderBottomColor: "rgba(0,0,0,.5)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,.55), inset 0 -2px 4px rgba(0,0,0,.4), 0 6px 14px rgba(0,0,0,.5), 0 2px 0 rgba(0,0,0,.45)",
                      }}
                    >
                      {loading ? "..." : "Notify Me"}
                    </button>
                  </div>
                </form>
                <span className="text-sm text-gray-400 tracking-wider">masseurmatch.com</span>
              </div>

              {/* Status messages */}
              {submitted && (
                <p className="text-sm text-green-400" style={{ animation: "mmfadeup 0.5s ease" }}>
                  Thanks! Check your email for updates.
                </p>
              )}
              {error && (
                <p className="text-sm text-red-400" style={{ animation: "mmfadeup 0.5s ease" }}>
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Hero (shown only on mobile) */}
      <div className="lg:hidden flex flex-col min-h-screen p-4 pt-8">
        {/* Background with gradients */}
        <div className="absolute inset-0 bg-[#1A1F2E] z-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(110% 70% at 50% 8%, #A8304A 0%, rgba(168,48,74,.30) 24%, rgba(168,48,74,0) 50%), linear-gradient(180deg, #212840 0%, #1A1F2E 50%, #12111c 100%)",
            }}
          ></div>
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(80% 60% at 50% 44%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)",
            }}
          ></div>

          {/* Animated ripples with mark */}
          <div
            className="absolute left-1/2 transform -translate-x-1/2 w-full flex items-center justify-center"
            style={{
              top: "60px",
              maxWidth: "280px",
              animation: "mmpulse 7s ease-in-out infinite",
            }}
          >
            <div className="relative w-64 h-64 flex items-center justify-center">
              <div className="absolute w-64 h-64 border border-white/[0.045] rounded-full"></div>
              <div className="absolute w-48 h-48 border border-white/6 rounded-full"></div>
              <div className="absolute w-32 h-32 border border-white/[0.085] rounded-full"></div>
              <div className="absolute w-16 h-16 border border-[#FFE0E7]/14 rounded-full"></div>
              <div
                className="absolute w-20 h-20 rounded-full blur-sm"
                style={{
                  background: "radial-gradient(circle, rgba(168,48,74,.35), rgba(168,48,74,0) 70%)",
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center h-full py-8 sm:py-16">
          {/* Logo */}
          <div
            className="mb-6 sm:mb-12"
            style={{
              animation: "mmfadein 0.9s ease 0.05s both",
              filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.55))",
            }}
          >
            <div className="h-12 sm:h-20 w-auto">
              <svg viewBox="0 0 200 100" className="h-full w-auto fill-white" xmlns="http://www.w3.org/2000/svg">
                <text x="10" y="80" fontSize="60" fontWeight="bold" fontFamily="Space Grotesk, monospace">MM</text>
              </svg>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-col items-center gap-4 sm:gap-8 flex-1 justify-center">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-3 px-6 py-3 border border-white/16 rounded-full bg-white/3"
              style={{ animation: "mmfadeup 0.8s ease 0.15s both" }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full bg-[#A8304A]"
                style={{
                  boxShadow: "0 0 12px #A8304A",
                  animation: "mmblink 2.4s ease-in-out infinite",
                }}
              ></span>
              <span className="text-base font-mono font-semibold tracking-widest text-gray-300 uppercase">
                Verified · LGBTQ+ Affirming
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-5xl sm:text-6xl font-bold tracking-tight text-white leading-none"
              style={{
                fontFamily: "Space Grotesk, monospace",
                animation: "mmfadeup 0.9s ease 0.28s both",
                lineHeight: "0.94",
              }}
            >
              Launching
              <br />
              <span
                style={{
                  background: "linear-gradient(100deg, #fff 0%, #e8a9b6 42%, #A8304A 70%, #fff 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "mmshimmer 6s linear infinite",
                }}
              >
                Soon
              </span>
            </h1>

            {/* Tagline */}
            <p
              className="text-lg sm:text-2xl leading-relaxed text-gray-300 max-w-sm"
              style={{ animation: "mmfadeup 0.9s ease 0.4s both" }}
            >
              AI-powered verified therapist discovery — a premium directory of male massage therapists you can trust.
            </p>
          </div>

          {/* Email Form */}
          <div
            className="w-full px-2"
            style={{ animation: "mmfadeup 0.9s ease 0.52s both" }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
              <div className="flex items-center h-16 sm:h-20 border border-white/16 rounded-full bg-white/4 px-4 sm:px-8 overflow-hidden">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-transparent text-lg sm:text-2xl text-gray-400 placeholder-gray-500 outline-none min-w-0"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-1 sm:ml-2 h-16 sm:h-20 px-6 sm:px-12 border-2 border-white/50 rounded-full font-bold text-lg sm:text-2xl tracking-wide text-white cursor-pointer transition-all whitespace-nowrap"
                  style={{
                    background: "repeating-linear-gradient(90deg, rgba(255,255,255,.10) 0px, rgba(255,255,255,.10) 1px, rgba(0,0,0,.08) 2px, rgba(0,0,0,.08) 3px), linear-gradient(180deg, #d76b83 0%, #b23a54 28%, #8a2338 52%, #a83048 74%, #661726 100%)",
                    borderTopColor: "#e58197",
                    borderBottomColor: "rgba(0,0,0,.5)",
                    boxShadow: "inset 0 2px 0 rgba(255,255,255,.55), inset 0 -3px 6px rgba(0,0,0,.4), 0 10px 22px rgba(0,0,0,.5), 0 3px 0 rgba(0,0,0,.45)",
                  }}
                >
                  {loading ? "..." : "Notify Me"}
                </button>
              </div>

              <span className="text-sm sm:text-2xl text-gray-400 tracking-wider">masseurmatch.com</span>

              {/* Status messages */}
              {submitted && (
                <p className="text-sm sm:text-lg text-green-400" style={{ animation: "mmfadeup 0.5s ease" }}>
                  Thanks! Check your email for updates.
                </p>
              )}
              {error && (
                <p className="text-sm sm:text-lg text-red-400" style={{ animation: "mmfadeup 0.5s ease" }}>
                  {error}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
