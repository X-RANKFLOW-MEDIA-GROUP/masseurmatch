export type FavoriteTherapist = {
  id: string;
  name: string;
  city: string;
  specialties: string[];
};

type FavoriteTherapistsProps = {
  therapists: FavoriteTherapist[];
};

export function FavoriteTherapists({ therapists }: FavoriteTherapistsProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-semibold">Favorite therapists</h2>
      <ul className="mt-4 space-y-3">
        {therapists.map((therapist) => (
          <li key={therapist.id} className="rounded-xl border border-border/80 p-3">
            <p className="font-medium">{therapist.name}</p>
            <p className="text-sm text-muted-foreground">{therapist.city}</p>
            <p className="mt-1 text-xs text-muted-foreground">{therapist.specialties.join(" • ")}</p>
          </li>
        ))}
        {!therapists.length && <li className="text-sm text-muted-foreground">No favorites saved yet.</li>}
      </ul>
    </section>
  );
}
