import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  sketch?: 'subtle' | 'medium' | 'strong' | 'none';
}

/**
 * IconCreditCard — payment / checkout / billing
 */
export function IconCreditCard({
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
      <rect x={10} y={18} width={44} height={28} rx={5} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" filter={filter} />
      <path d="M10 28H54" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" filter={filter} />
      <path d="M18 38H26" stroke="currentColor" strokeWidth={2} strokeLinecap="round" filter={filter} />
      <path d="M36 38H40" stroke="currentColor" strokeWidth={2} strokeLinecap="round" filter={filter} />
    </svg>
  );
}
