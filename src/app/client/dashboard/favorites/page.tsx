"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Search, Star, MapPin, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ClientDashboardLayout } from "../_components/ClientDashboardLayout";
import { toast } from "sonner";

type Favorite = {
  id: string;
  therapist_id: string;
  created_at: string;
  therapist: {
    id: string;
    full_name: string;
    profile_image_url: string;
    city: string;
    state_code: string;
    specialties: string[];
    hourly_rate_min: number;
    hourly_rate_max: number;
    average_rating: number;
    total_reviews: number;
  };
};

export default function ClientFavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const supabase = createClient();

  const fetchFavorites = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("client_favorites")
      .select(`
        id,
        therapist_id,
        created_at,
        therapist:therapist_profiles!therapist_id (
          id,
          full_name,
          profile_image_url,
          city,
          state_code,
          specialties,
          hourly_rate_min,
          hourly_rate_max,
          average_rating,
          total_reviews
        )
      `)
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setFavorites(data as unknown as Favorite[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  async function removeFavorite(favoriteId: string) {
    const { error } = await supabase
      .from("client_favorites")
      .delete()
      .eq("id", favoriteId);

    if (!error) {
      setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
      toast.success("Removed from favorites");
    } else {
      toast.error("Failed to remove favorite");
    }
  }

  const filteredFavorites = favorites
    .filter((fav) =>
      fav.therapist?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fav.therapist?.specialties?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.therapist?.full_name ?? "").localeCompare(b.therapist?.full_name ?? "");
        case "rating":
          return (b.therapist?.average_rating ?? 0) - (a.therapist?.average_rating ?? 0);
        case "price-low":
          return (a.therapist?.hourly_rate_min ?? 0) - (b.therapist?.hourly_rate_min ?? 0);
        case "price-high":
          return (b.therapist?.hourly_rate_max ?? 0) - (a.therapist?.hourly_rate_max ?? 0);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">My Favorites</h1>
          <p className="mt-1 text-slate-500">
            {favorites.length} saved therapist{favorites.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Added</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : filteredFavorites.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-12 w-12 text-slate-300" />
              <h3 className="mt-4 font-medium text-slate-900">No favorites yet</h3>
              <p className="mt-1 text-sm text-slate-500">
                {searchQuery ? "Try a different search term" : "Save therapists you like for quick access"}
              </p>
              <Button asChild className="mt-4">
                <Link href="/explore">Explore Therapists</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFavorites.map((favorite) => (
              <Card key={favorite.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative aspect-[4/3]">
                  {favorite.therapist?.profile_image_url ? (
                    <Image
                      src={favorite.therapist.profile_image_url}
                      alt={favorite.therapist.full_name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100">
                      <Heart className="h-12 w-12 text-slate-300" />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8 bg-white/90 hover:bg-white"
                    onClick={() => removeFavorite(favorite.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                <CardContent className="p-4">
                  <Link href={`/therapists/${favorite.therapist_id}`} className="block">
                    <h3 className="font-semibold text-slate-900 hover:text-sky-600">
                      {favorite.therapist?.full_name}
                    </h3>
                  </Link>

                  <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {favorite.therapist?.city}, {favorite.therapist?.state_code}
                  </div>

                  {favorite.therapist?.average_rating > 0 && (
                    <div className="mt-2 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-slate-900">
                        {favorite.therapist.average_rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-slate-500">
                        ({favorite.therapist.total_reviews} reviews)
                      </span>
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap gap-1">
                    {favorite.therapist?.specialties?.slice(0, 3).map((specialty) => (
                      <span
                        key={specialty}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      ${favorite.therapist?.hourly_rate_min}
                      {favorite.therapist?.hourly_rate_max !== favorite.therapist?.hourly_rate_min && (
                        <span>-${favorite.therapist?.hourly_rate_max}</span>
                      )}
                      <span className="text-sm font-normal text-slate-500">/hr</span>
                    </span>
                    <Button size="sm" asChild>
                      <Link href={`/therapists/${favorite.therapist_id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ClientDashboardLayout>
  );
}
