import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  sketch?: 'subtle' | 'medium' | 'strong' | 'none';
}

/**
 * IconSliders — filters / preferences / settings
 */
export function IconSliders({
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
      <path d="M12 20H52" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" filter={filter} />
      <path d="M12 32H52" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" filter={filter} />
      <path d="M12 44H52" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" filter={filter} />
      <circle cx={22} cy={20} r={4} stroke="currentColor" strokeWidth={1.7} filter={filter} />
      <circle cx={40} cy={32} r={4} stroke="currentColor" strokeWidth={1.7} filter={filter} />
      <circle cx={28} cy={44} r={4} stroke="currentColor" strokeWidth={1.7} filter={filter} />
    </svg>
  );
}
