import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  sketch?: 'subtle' | 'medium' | 'strong' | 'none';
}

/**
 * IconLock — privacy / security / data protection
 */
export function IconLock({
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
      <rect x={14} y={30} width={36} height={24} rx={5} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" filter={filter} />
      <path
        d="M22 30V22C22 16.5 26.5 12 32 12C37.5 12 42 16.5 42 22V30"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={filter}
      />
      <circle cx={32} cy={42} r={3} stroke="currentColor" strokeWidth={1.7} filter={filter} />
      <path d="M32 45V49" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" filter={filter} />
    </svg>
  );
}
