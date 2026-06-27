import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  sketch?: 'subtle' | 'medium' | 'strong' | 'none';
}

/**
 * IconAward — certification / badge / achievement
 */
export function IconAward({
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
      <circle cx={32} cy={26} r={14} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" filter={filter} />
      <path d="M24 38.5L20 54L32 47L44 54L40 38.5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" filter={filter} />
      <path d="M32 18V22" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" filter={filter} />
      <path d="M32 22L36 26" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" filter={filter} />
    </svg>
  );
}
