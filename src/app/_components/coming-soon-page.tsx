"use client";

import { useState } from "react";

export function ComingSoonPage() {
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
                      animation: "mmshimmer 3s ease-in-out infinite",
                    }}
                  >
                    Soon
                  </span>
                </h1>

                {/* Description */}
                <p
                  className="text-lg text-gray-400 leading-relaxed max-w-lg"
                  style={{
                    animation: "mmfadeup 1s ease 0.4s both",
                  }}
                >
                  The most trustworthy directory of LGBTQ+-affirming male massage therapists in the US. Launching soon with verified profiles and premium matching.
                </p>

                {/* Email capture form */}
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-3 mt-6 w-full max-w-sm"
                  style={{
                    animation: "mmfadeup 1.1s ease 0.5s both",
                  }}
                >
                  <div className="relative flex items-center rounded-lg border border-white/20 bg-white/4 backdrop-blur-sm overflow-hidden">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="flex-1 px-4 py-3 bg-transparent text-white placeholder-gray-500 focus:outline-none disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={loading || !email}
                      className="px-6 py-3 bg-[#A8304A] text-white font-semibold hover:bg-[#8B1E2D] disabled:opacity-50 transition"
                    >
                      {loading ? "…" : "Notify"}
                    </button>
                  </div>
                  {error && <p className="text-sm text-red-400">{error}</p>}
                  {submitted && (
                    <p className="text-sm text-green-400">Thank you! Check your email for updates.</p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-gradient-to-b from-[#0c0f18] to-[#1A1F2E]">
        <div
          className="text-center"
          style={{
            animation: "mmfadein 0.9s ease both",
          }}
        >
          <div className="h-12 w-auto mx-auto mb-8">
            <svg viewBox="0 0 200 100" className="h-full w-auto fill-white" xmlns="http://www.w3.org/2000/svg">
              <text x="10" y="80" fontSize="60" fontWeight="bold" fontFamily="Space Grotesk, monospace">MM</text>
            </svg>
          </div>

          <div className="space-y-4 mb-8">
            <div
              className="inline-flex items-center gap-2.5 px-4 py-2 border border-white/16 rounded-full bg-white/3"
              style={{ animation: "mmfadeup 0.8s ease 0.15s both" }}
            >
              <span className="w-2 h-2 rounded-full bg-[#A8304A]" style={{ boxShadow: "0 0 10px #A8304A" }}></span>
              <span className="text-xs font-mono font-semibold tracking-widest text-gray-300 uppercase">Verified</span>
            </div>

            <h1
              className="text-5xl font-bold tracking-tight text-white"
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
                  animation: "mmshimmer 3s ease-in-out infinite",
                }}
              >
                Soon
              </span>
            </h1>

            <p
              className="text-base text-gray-400 leading-relaxed mt-4"
              style={{
                animation: "mmfadeup 1s ease 0.4s both",
              }}
            >
              The most trustworthy directory of verified, LGBTQ+-affirming male massage therapists in the US.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 mt-8 w-full"
            style={{
              animation: "mmfadeup 1.1s ease 0.5s both",
            }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="px-4 py-3 rounded-lg border border-white/20 bg-white/4 text-white placeholder-gray-500 focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !email}
              className="px-6 py-3 bg-[#A8304A] text-white font-semibold rounded-lg hover:bg-[#8B1E2D] disabled:opacity-50 transition"
            >
              {loading ? "…" : "Notify me"}
            </button>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {submitted && (
              <p className="text-sm text-green-400">Thank you! Check your email for updates.</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
