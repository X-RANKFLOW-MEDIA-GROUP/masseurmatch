import { MessageSquareQuote, Star } from "lucide-react";

import type { PublicImportedReview } from "@/app/_lib/directory";

function formatReviewDate(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function ImportedReviewsSection({
  reviews,
}: {
  reviews: PublicImportedReview[];
}) {
  if (!reviews.length) return null;

  return (
    <section
      id="imported-reviews"
      className="border-t border-[#E8E8E8] bg-[#FAFAFA] px-4 py-14 sm:px-6 sm:py-16"
      aria-labelledby="imported-reviews-title"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8B1E2D]">
            Previous client feedback
          </p>
          <h2
            id="imported-reviews-title"
            className="mt-1.5 font-display text-2xl font-extrabold tracking-tight text-[#111111] sm:text-3xl"
          >
            Imported reviews
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#5A5147]">
            These reviews were imported from the provider&apos;s previous profile and reviewed before publication on MasseurMatch.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => {
            const date = formatReviewDate(review.review_date);
            const rating =
              typeof review.rating === "number" && review.rating >= 1 && review.rating <= 5
                ? Math.round(review.rating)
                : null;

            return (
              <article
                key={review.id}
                className="flex h-full flex-col rounded-2xl border border-[#E8E8E8] bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <MessageSquareQuote className="h-5 w-5 text-[#8B1E2D]" strokeWidth={2.1} />
                  {rating ? (
                    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= rating
                              ? "fill-[#8B1E2D] text-[#8B1E2D]"
                              : "text-slate-300"
                          }`}
                          strokeWidth={star <= rating ? 0 : 1.75}
                        />
                      ))}
                    </span>
                  ) : null}
                </div>

                <blockquote className="flex-1 text-[15px] leading-7 text-[#3F3A33]">
                  &ldquo;{review.review_text}&rdquo;
                </blockquote>

                <footer className="mt-5 border-t border-[#F0ECE8] pt-4">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <span className="font-semibold text-[#111111]">
                      {review.reviewer_name || "Anonymous reviewer"}
                    </span>
                    {date ? <span className="text-[#7A7168]">{date}</span> : null}
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#8E8E8E]">
                    {review.public_label || "Imported review"}
                  </p>
                </footer>
              </article>
            );
          })}
        </div>

        <p className="mt-6 max-w-3xl text-xs leading-5 text-[#7A7168]">
          Imported reviews reflect feedback originally submitted elsewhere. MasseurMatch did not independently verify the original transaction or reviewer identity.
        </p>
      </div>
    </section>
  );
}
