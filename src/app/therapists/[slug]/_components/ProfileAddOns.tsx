import type { PublicTherapist, ProfileAddOn } from "@/app/_lib/directory";

function normalizeAddOns(value: unknown): ProfileAddOn[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is ProfileAddOn =>
      typeof item === "object" && item !== null && typeof (item as ProfileAddOn).name === "string",
  );
}

interface Props {
  profile: PublicTherapist;
}

export function ProfileAddOns({ profile }: Props) {
  const addOns = normalizeAddOns(profile.add_ons);
  if (addOns.length === 0) return null;

  return (
    <section className="profile-panel p-6 md:p-7">
      <h2 className="text-2xl font-semibold text-foreground">Massage Add-On Services</h2>

      <div className="mt-4 space-y-2">
        {addOns.map((addon, i) => (
          <div key={`addon-${i}`} className="profile-panel-soft flex items-center justify-between rounded-2xl px-4 py-3 text-sm">
            <span className="font-medium text-foreground">{addon.name}</span>
            <span className="font-semibold text-foreground">${addon.price}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
