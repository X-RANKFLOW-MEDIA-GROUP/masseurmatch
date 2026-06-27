export function SketchFilters() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "none" }}
    >
      <defs>
        {/* Subtle hand-drawn wobble for icons */}
        <filter id="sketch-subtle" x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.035 0.05"
            numOctaves="3"
            seed="8"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="1.4"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Stronger sketch for decorative dividers and card borders */}
        <filter id="sketch-medium" x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.07"
            numOctaves="4"
            seed="3"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2.2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Trust-badge shimmer with warm highlight */}
        <filter id="sketch-glow" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04 0.06"
            numOctaves="3"
            seed="12"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="1.8"
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
