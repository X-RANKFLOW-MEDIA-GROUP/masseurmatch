import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  sketch?: 'subtle' | 'medium' | 'strong' | 'none';
}

/**
 * IconCalendar — booking / schedule / availability
 */
export function IconCalendar({
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
      <rect x={12} y={16} width={40} height={36} rx={5} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" filter={filter} />
      <path d="M12 27H52" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" filter={filter} />
      <path d="M22 12V20" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" filter={filter} />
      <path d="M42 12V20" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" filter={filter} />
      <path d="M22 36H24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" filter={filter} />
      <path d="M31 36H33" stroke="currentColor" strokeWidth={2} strokeLinecap="round" filter={filter} />
      <path d="M40 36H42" stroke="currentColor" strokeWidth={2} strokeLinecap="round" filter={filter} />
      <path d="M22 44H24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" filter={filter} />
      <path d="M31 44H33" stroke="currentColor" strokeWidth={2} strokeLinecap="round" filter={filter} />
    </svg>
  );
}
