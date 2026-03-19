"use client";

import { motion } from "framer-motion";
import { Star, ThumbsUp, MessageCircle } from "lucide-react";
import { fadeInUp } from "@/components/animations/MicroInteractions";

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  verified: boolean;
  helpful: number;
  date: string;
}

export interface RatingSystemProps {
  averageRating: number;
  totalReviews: number;
  reviews?: Review[];
  showBreakdown?: boolean;
  compact?: boolean;
}

export function RatingBadge({
  rating,
  totalReviews,
  size = "md",
}: {
  rating: number;
  totalReviews: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const starSize = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  return (
    <motion.div
      className={`flex items-center gap-2 ${sizeClasses[size]}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, rotate: -20 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Star
              size={starSize[size]}
              className={i < Math.floor(rating) ? "fill-brand-accent text-brand-accent" : "text-border"}
            />
          </motion.div>
        ))}
      </div>
      <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
      <span className="text-muted-foreground">({totalReviews})</span>
    </motion.div>
  );
}

export function RatingBreakdown({
  averageRating,
  totalReviews,
  breakdown = {
    5: Math.round(totalReviews * 0.6),
    4: Math.round(totalReviews * 0.2),
    3: Math.round(totalReviews * 0.1),
    2: Math.round(totalReviews * 0.05),
    1: Math.round(totalReviews * 0.05),
  },
}: {
  averageRating: number;
  totalReviews: number;
  breakdown?: Record<number, number>;
}) {
  return (
    <motion.div
      className="space-y-3"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
      initial="hidden"
      animate="visible"
    >
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = breakdown[stars] || 0;
        const percentage = (count / totalReviews) * 100;

        return (
          <motion.div
            key={stars}
            className="flex items-center gap-3"
          >
            <span className="w-16 text-sm font-medium text-muted-foreground">
              {stars} star{stars === 1 ? "" : "s"}
            </span>
            <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-accent to-brand-gold"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="text-sm text-muted-foreground w-12 text-right">
              {percentage.toFixed(0)}%
            </span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <motion.div
      className="p-5 bg-card border border-border rounded-lg hover:border-brand-electric/30 transition-all"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(47, 111, 228, 0.1)" }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-electric to-brand-accent flex items-center justify-center text-white text-sm font-bold">
            {review.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-foreground">{review.author}</div>
            {review.verified && (
              <div className="text-xs font-semibold text-brand-electric">Verified</div>
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">{review.date}</div>
      </div>

      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < review.rating ? "fill-brand-accent text-brand-accent" : "text-border"}
          />
        ))}
      </div>

      <p className="text-foreground text-sm mb-4 leading-relaxed">{review.text}</p>

      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ThumbsUp size={14} />
          <span>Helpful ({review.helpful})</span>
        </button>
        <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <MessageCircle size={14} />
          <span>Reply</span>
        </button>
      </motion.div>
    </motion.div>
  );
}

export function RatingSystem({
  averageRating,
  totalReviews,
  reviews = [],
  showBreakdown = true,
  compact = false,
}: RatingSystemProps) {
  return (
    <motion.div
      className={`${compact ? "space-y-4" : "space-y-8"}`}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        variants={fadeInUp}
      >
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Reviews</h3>
          <RatingBadge rating={averageRating} totalReviews={totalReviews} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {showBreakdown && (
          <motion.div variants={fadeInUp}>
            <RatingBreakdown averageRating={averageRating} totalReviews={totalReviews} />
          </motion.div>
        )}

        <motion.div
          className={showBreakdown ? "md:col-span-2" : "md:col-span-3"}
          variants={fadeInUp}
        >
          <div className="space-y-4">
            {reviews.slice(0, compact ? 2 : 5).map((review, i) => (
              <motion.div key={review.id} variants={fadeInUp} custom={i}>
                <ReviewCard review={review} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Quick stats component for profiles
export function ProfileRatingStats({
  rating,
  totalReviews,
  responseTime = "Usually responds within 2 hours",
}: {
  rating: number;
  totalReviews: number;
  responseTime?: string;
}) {
  return (
    <motion.div
      className="flex items-center gap-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="text-center">
        <div className="text-3xl font-bold text-brand-primary mb-1">
          {rating.toFixed(1)}
        </div>
        <div className="flex justify-center mb-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < Math.round(rating) ? "fill-brand-accent text-brand-accent" : "text-border"}
            />
          ))}
        </div>
        <div className="text-sm text-muted-foreground">{totalReviews} reviews</div>
      </div>
      <div className="h-12 w-px bg-border" />
      <div className="text-sm">
        <div className="font-semibold text-foreground mb-1">Response Time</div>
        <div className="text-muted-foreground">{responseTime}</div>
      </div>
    </motion.div>
  );
}
