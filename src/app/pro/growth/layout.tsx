import type { ReactNode } from "react";

export default function GrowthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        input[list^="travel-cities-"] {
          min-width: 10rem;
          text-overflow: ellipsis;
        }
        @media (max-width: 639px) {
          input[list^="travel-cities-"] {
            min-width: 0;
            width: 100%;
          }
        }
      `}</style>
      {children}
    </>
  );
}
