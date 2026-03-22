"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { getPublicTherapists, type PublicTherapist } from "@/app/_lib/directory";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function TherapistPageClient({ slug }: { slug: string }) {
  const [profile, setProfile] = useState<PublicTherapist | null>(null);
  const [reviews, setReviews] = useState<Array<{ id: string; review_text: string; rating: number | null }>>([]);

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
  }, [slug]);

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

  if (!profile) {
    return <div className="container mx-auto px-4 py-10">Loading profile...</div>;
  }

  const citySlug = (profile.city || "").toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {jsonLd ? <JsonLd data={jsonLd} /> : null}

      <div className="grid md:grid-cols-[220px_1fr] gap-6">
        <Image
          src={profile.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop"}
          alt={profile.display_name || profile.full_name || "Therapist"}
          width={220}
          height={220}
          className="rounded-lg object-cover w-[220px] h-[220px]"
        />
        <div>
          <h1 className="text-3xl font-bold">{profile.display_name || profile.full_name}</h1>
          <p className="text-muted-foreground mt-1">{profile.city || "US"}</p>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{profile.bio || "No bio available."}</p>

          <div className="mt-5 flex gap-3">
            <a className="text-sm underline" href={`mailto:contact+${profile.id}@masseurmatch.com`}>Direct contact</a>
            <a className="text-sm underline" href="tel:+10000000000">Call</a>
          </div>

          <div className="mt-5 text-sm text-muted-foreground">
            <p>Tier: {profile._tier || "free"}</p>
            <p>Specialties: {(profile.specialties || []).join(", ") || "Massage Therapy"}</p>
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
              <p className="text-xs text-muted-foreground mt-1">Rating: {review.rating ?? "N/A"}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <Link className="text-sm underline" href={citySlug ? `/${citySlug}` : "/search"}>Back to city</Link>
      </div>
    </div>
  );
}
