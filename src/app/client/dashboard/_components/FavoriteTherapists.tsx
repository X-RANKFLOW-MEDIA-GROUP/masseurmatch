'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Star, Trash2 } from 'lucide-react';

type FavoriteTherapist = {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  image_url: string;
  city: string;
  rating: number;
  review_count: number;
};

export function FavoriteTherapists({ userId }: { userId: string }) {
  const [favorites, setFavorites] = useState<FavoriteTherapist[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadFavorites() {
      const { data, error } = await supabase
        .from('client_favorites')
        .select(
          `
          therapist_id,
          profiles (
            id,
            first_name,
            last_name,
            specialty,
            image_url,
            city,
            rating,
            review_count
          )
        `
        )
        .eq('client_id', userId);

      if (!error && data) {
        const therapists = data
          .map((item: any) => item.profiles)
          .filter(Boolean);
        setFavorites(therapists);
      }
      setLoading(false);
    }

    loadFavorites();
  }, [userId, supabase]);

  const removeFavorite = async (therapistId: string) => {
    await supabase
      .from('client_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('therapist_id', therapistId);

    setFavorites(favorites.filter(f => f.id !== therapistId));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Your Favorite Therapists ({favorites.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500" />
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((therapist) => (
              <Link
                key={therapist.id}
                href={`/therapists/${therapist.id}`}
                className="group relative rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-[3/4] relative bg-slate-100">
                  {therapist.image_url && (
                    <Image
                      src={therapist.image_url}
                      alt={`${therapist.first_name} ${therapist.last_name}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-slate-900">
                    {therapist.first_name} {therapist.last_name}
                  </h4>
                  <p className="text-xs text-slate-600 mb-2">{therapist.specialty}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{therapist.rating}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeFavorite(therapist.id);
                      }}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {therapist.city && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-600">
                      <MapPin className="h-3 w-3" />
                      {therapist.city}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
            <Heart className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm text-slate-600">
              No favorites yet. Add therapists you like!
            </p>
            <Button asChild className="mt-4">
              <Link href="/explore">Explore Therapists</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
