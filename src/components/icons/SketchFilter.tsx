/**
 * SketchFilter — shared SVG filter for the hand-drawn sketch effect.
 * Render this ONCE at the top of your layout (e.g. inside <body> or RootLayout).
 * All sketch icons reference these filter IDs.
 */
export function SketchFilter() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Subtle sketch — for most icons */}
        <filter id="sketch-subtle" x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.035 0.05"
            numOctaves={3}
            seed={8}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={1.4}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Medium sketch — for hero / large icons */}
        <filter id="sketch-medium" x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.07"
            numOctaves={4}
            seed={3}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={2.2}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Strong sketch — for decorative / accent use only */}
        <filter id="sketch-strong" x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.022"
            numOctaves={3}
            seed={11}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={2.0}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Trust-badge shimmer with warm highlight */}
        <filter id="sketch-glow" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04 0.06"
            numOctaves={3}
            seed={12}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={1.8}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feComposite in="displaced" in2="SourceGraphic" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}
