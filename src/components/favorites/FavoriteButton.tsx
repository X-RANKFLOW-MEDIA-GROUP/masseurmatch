"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  therapistId: string;
  variant?: "icon" | "button";
  className?: string;
}

export function FavoriteButton({ therapistId, variant = "icon", className }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkFavorite() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("client_favorites")
        .select("id")
        .eq("client_user_id", user.id)
        .eq("therapist_profile_id", therapistId)
        .maybeSingle();

      setIsFavorite(!!data);
      setLoading(false);
    }

    checkFavorite();
  }, [therapistId, supabase]);

  async function toggleFavorite() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to save favorites");
      return;
    }

    setToggling(true);

    if (isFavorite) {
      const { error } = await supabase
        .from("client_favorites")
        .delete()
        .eq("client_user_id", user.id)
        .eq("therapist_profile_id", therapistId);

      if (error) {
        toast.error("Failed to remove from favorites");
      } else {
        setIsFavorite(false);
        toast.success("Removed from favorites");
      }
    } else {
      const { error } = await supabase
        .from("client_favorites")
        .insert({
          client_user_id: user.id,
          therapist_profile_id: therapistId,
        });

      if (error) {
        toast.error("Failed to add to favorites");
      } else {
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    }

    setToggling(false);
  }

  if (loading) {
    return variant === "icon" ? (
      <Button variant="ghost" size="icon" disabled className={className}>
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    ) : (
      <Button variant="outline" disabled className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleFavorite}
        disabled={toggling}
        className={cn(
          "transition-transform hover:scale-110",
          isFavorite && "text-red-500 hover:text-red-600",
          className
        )}
      >
        <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
      </Button>
    );
  }

  return (
    <Button
      variant={isFavorite ? "default" : "outline"}
      onClick={toggleFavorite}
      disabled={toggling}
      className={cn(
        isFavorite && "bg-red-500 hover:bg-red-600",
        className
      )}
    >
      {toggling ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Heart className={cn("mr-2 h-4 w-4", isFavorite && "fill-current")} />
      )}
      {isFavorite ? "Saved" : "Save"}
    </Button>
  );
}
