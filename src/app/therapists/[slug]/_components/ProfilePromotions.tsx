import type { PublicTherapist, ProfilePromotion } from "@/app/_lib/directory";

function normalizePromotions(value: unknown): ProfilePromotion[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is ProfilePromotion =>
      typeof item === "object" && item !== null && typeof (item as ProfilePromotion).title === "string",
  );
}

interface Props {
  profile: PublicTherapist;
}

export function ProfilePromotions({ profile }: Props) {
  const promos = normalizePromotions(profile.promotions);
  const city = profile.city || "your area";
  if (promos.length === 0) return null;

  return (
    <section className="profile-panel p-6 md:p-7">
      <h2 className="text-2xl font-semibold text-foreground">Massage Deals in {city}</h2>

      <div className="mt-4 space-y-3">
        {promos.map((promo, i) => (
          <div key={`promo-${i}`} className="profile-panel-soft rounded-2xl px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{promo.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{promo.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
