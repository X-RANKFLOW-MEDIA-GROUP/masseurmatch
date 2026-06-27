import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  sketch?: 'subtle' | 'medium' | 'strong' | 'none';
}

/**
 * IconGlobe — website / language / online presence
 */
export function IconGlobe({
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
      <circle cx={32} cy={32} r={20} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" filter={filter} />
      <path d="M12 32H52" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" filter={filter} />
      <path d="M32 12C32 12 24 20 24 32C24 44 32 52 32 52" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" filter={filter} />
      <path d="M32 12C32 12 40 20 40 32C40 44 32 52 32 52" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" filter={filter} />
    </svg>
  );
}
