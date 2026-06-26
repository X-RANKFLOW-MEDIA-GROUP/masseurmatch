import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  sketch?: 'subtle' | 'medium' | 'strong' | 'none';
}

/**
 * IconUser — therapist profile / account
 */
export function IconUser({
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
      <circle cx={32} cy={22} r={10} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" filter={filter} />
      <path
        d="M12 54C12 43.5 21 35 32 35C43 35 52 43.5 52 54"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={filter}
      />
    </svg>
  );
}
