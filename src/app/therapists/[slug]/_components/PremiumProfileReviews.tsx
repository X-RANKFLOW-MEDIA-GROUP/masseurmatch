"use client";

import type { ImportedReview } from "@/app/_lib/directory";

interface Props {
  reviews: ImportedReview[];
  city: string;
}

export function PremiumProfileReviews({ reviews, city }: Props) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="pp-fade-in" id="reviews">
      <div className="pp-sec-label">Client Testimonials</div>
      <div className="pp-sec-title">What Clients Say</div>
      <div className="pp-review-list">
        {reviews.map((review) => (
          <div key={review.id} className="pp-review-card">
            <div className="pp-review-meta">
              <span className="pp-review-location">
                📍 {city} · {review.reviewer_name ? "Verified client" : "In-studio"}
              </span>
              {review.review_date && (
                <span className="pp-review-date">{formatDate(review.review_date)}</span>
              )}
            </div>
            <div className="pp-review-title">
              &ldquo;{review.review_text.slice(0, 60)}{review.review_text.length > 60 ? "..." : ""}&rdquo;
            </div>
            <div className="pp-review-body">{review.review_text}</div>
          </div>
        ))}
      </div>
      {reviews.length >= 3 && (
        <div className="pp-review-more">
          <a href="#reviews" className="pp-link-more">View all {reviews.length} reviews →</a>
        </div>
      )}
    </section>
  );
}
