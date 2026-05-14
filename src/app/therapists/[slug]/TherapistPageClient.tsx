"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { getPublicTherapists, type PublicTherapist } from "@/app/_lib/directory";
import BookingModal from "./_components/BookingModal";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function TherapistPageClient({ slug }: { slug: string }) {
  const [profile, setProfile] = useState<PublicTherapist | null>(null);
  const [reviews, setReviews] = useState<Array<{ id: string; review_text: string; rating: number | null }>>([]);
  const [showBooking, setShowBooking] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    getPublicTherapists({ page: 1, pageSize: 300 }).then((res) => {
      const found = res.items.find((item) => (item.slug || item.id) === slug) || null;
      setProfile(found);
      if (found?.id) {
        supabase
          .from("imported_reviews")
          .select("id, review_text, rating")
          .eq("profile_id", found.id)
          .limit(5)
          .then(({ data }) => setReviews((data || []) as typeof reviews));
      }
    });
    // Check favorites
    fetch("/api/favorites")
      .then(r => r.json())
      .then(d => {
        if (d.favorites && profile?.id) setIsFavorited(d.favorites.includes(profile.id));
      })
      .catch(() => {});
  }, [slug]); // eslint-disable-line

  const jsonLd = useMemo(() => {
    if (!profile) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Person",
      name: profile.display_name || profile.full_name,
      description: profile.bio,
      address: { "@type": "PostalAddress", addressLocality: profile.city || "" },
    };
  }, [profile]);

  const toggleFavorite = async () => {
    if (!profile?.id) return;
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ therapist_id: profile.id }),
    });
    const data = await res.json();
    if (data.favorited !== undefined) setIsFavorited(data.favorited);
  };

  if (!profile) {
    return <div className="container mx-auto px-4 py-10">Loading profile...</div>;
  }

  const citySlug = (profile.city || "").toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {jsonLd ? <JsonLd data={jsonLd} /> : null}

      <div className="grid md:grid-cols-[220px_1fr] gap-6">
        <div className="relative">
          <Image
            src={profile.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop"}
            alt={profile.display_name || profile.full_name || "Therapist"}
            width={220}
            height={220}
            className="rounded-lg object-cover w-[220px] h-[220px]"
          />
          <button
            onClick={toggleFavorite}
            className="absolute top-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
            title={isFavorited ? "Remove from favorites" : "Save therapist"}
          >
            {isFavorited ? "❤️" : "🤍"}
          </button>
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{profile.display_name || profile.full_name}</h1>
              <p className="text-muted-foreground mt-1">{profile.city || "US"}</p>
            </div>
            {profile._tier === "featured" && (
              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-semibold">⭐ Featured</span>
            )}
          </div>

          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{profile.bio || "No bio available."}
          </p>

          <div className="mt-4 text-sm text-muted-foreground">
            <p><strong>Specialties:</strong> {(profile.specialties || []).join(", ") || "Massage Therapy"}</p>
          </div>

          {/* CTA Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setShowBooking(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm"
            >
              📅 Book Appointment
            </button>
            <a
              href={`/client/messages?new=${profile.id}`}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-5 py-3 rounded-xl transition-colors"
            >
              💬 Message
            </a>
            <button
              onClick={toggleFavorite}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-3 rounded-xl transition-colors"
            >
              {isFavorited ? "❤️ Saved" : "🤍 Save"}
            </button>
          </div>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Reviews</h2>
        <div className="space-y-2">
          {reviews.length === 0 ? <p className="text-sm text-muted-foreground">No reviews yet.</p> : null}
          {reviews.map((review) => (
            <div key={review.id} className="rounded-md border border-border p-3">
              <p className="text-sm text-muted-foreground">{review.review_text}</p>
              <p className="text-xs text-muted-foreground mt-1">⭐ {review.rating ?? "N/A"}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <Link className="text-sm underline" href={citySlug ? `/${citySlug}` : "/search"}>← Back to city</Link>
      </div>

      {showBooking && profile && (
        <BookingModal
          therapist={profile}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
}
