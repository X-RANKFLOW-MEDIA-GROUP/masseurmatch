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
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Subtle sketch — for most icons */}
        <filter id="sketch-subtle">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.018"
            numOctaves={2}
            seed={3}
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={1.2} />
        </filter>

        {/* Medium sketch — for hero / large icons */}
        <filter id="sketch-medium">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02"
            numOctaves={2}
            seed={7}
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={1.6} />
        </filter>

        {/* Strong sketch — for decorative / accent use only */}
        <filter id="sketch-strong">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.022"
            numOctaves={3}
            seed={11}
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={2.0} />
        </filter>
      </defs>
    </svg>
  );
}
