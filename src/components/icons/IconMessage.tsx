import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  sketch?: 'subtle' | 'medium' | 'strong' | 'none';
}

/**
 * IconMessage — chat / contact / review
 */
export function IconMessage({
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
        d="M12 14H52V44H36L26 54V44H12V14Z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={filter}
      />
      <path d="M22 26H42" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" filter={filter} />
      <path d="M22 33H34" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" filter={filter} />
    </svg>
  );
}
