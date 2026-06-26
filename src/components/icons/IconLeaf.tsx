import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  sketch?: 'subtle' | 'medium' | 'strong' | 'none';
}

/**
 * IconLeaf — wellness / natural / relaxation
 */
export function IconLeaf({
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
        d="M50 14C50 14 48 40 20 48C20 48 18 30 32 20C38 16 50 14 50 14Z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={filter}
      />
      <path d="M14 50L32 32" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" filter={filter} />
    </svg>
  );
}
