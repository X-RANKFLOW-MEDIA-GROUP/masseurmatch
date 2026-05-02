import { ArrowRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

type FinalCTAProps = {
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
};

export function FinalCTA({ searchInputRef }: FinalCTAProps) {
  const handleSearchAgain = () => {
    if (searchInputRef?.current) {
      searchInputRef.current.focus();
      searchInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section className="bg-brand-primary py-16 text-white sm:py-20">
      <div className="page-shell mx-auto max-w-2xl text-center">
        <h2 className="font-display text-4xl font-light leading-tight sm:text-5xl">
          Ready to find your therapist?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base text-white/70">
          Search again to discover verified massage therapists near you with transparent pricing and direct contact.
        </p>
        <Button
          variant="premium"
          size="lg"
          className="mt-8 rounded-full px-8"
          onClick={handleSearchAgain}
        >
          <Search className="mr-2 h-4 w-4" />
          Search again
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
