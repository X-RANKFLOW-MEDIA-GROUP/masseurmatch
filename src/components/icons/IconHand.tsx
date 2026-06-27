import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  sketch?: 'subtle' | 'medium' | 'strong' | 'none';
}

/**
 * IconHand — massage / touch / service
 * Style: luxury masculine hand-drawn thin line
 */
export function IconHand({
  size = 24,
  sketch = 'subtle',
  className,
  ...props
}: IconProps) {
  const filter = sketch !== 'none' ? `url(#sketch-${sketch})` : undefined;

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M18 35C20 32 23 30.5 26 31V20.5C26 18.6 27.5 17 29.4 17C31.3 17 32.8 18.6 32.8 20.5V32"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={filter}
      />
      <path d="M32.8 22V34" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" filter={filter} />
      <path d="M36 23V35" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" filter={filter} />
      <path d="M39.2 25V36.2" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" filter={filter} />
      <path
        d="M42.6 28.2V37.5C42.6 44 37.4 49 31 49H28C22.5 49 18 44.5 18 39V35"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={filter}
      />
    </svg>
  );
}
