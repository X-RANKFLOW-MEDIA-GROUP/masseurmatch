import { OutcallMilesNormalizer } from "./OutcallMilesNormalizer";

export default function ListingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OutcallMilesNormalizer />
      {children}
    </>
  );
}
