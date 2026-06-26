import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  sketch?: 'subtle' | 'medium' | 'strong' | 'none';
}

/**
 * IconMapPin — location / nearby / city search
 * Style: luxury masculine hand-drawn thin line
 */
export function IconMapPin({
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
        d="M32 54C32 54 46 39.4 46 28.5C46 20.2 39.8 14 32 14C24.2 14 18 20.2 18 28.5C18 39.4 32 54 32 54Z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={filter}
      />
      <circle
        cx={32}
        cy={29}
        r={4.5}
        stroke="currentColor"
        strokeWidth={1.7}
        filter={filter}
      />
    </svg>
  );
}
