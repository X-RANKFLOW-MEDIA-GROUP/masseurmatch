import type { PublicTherapist } from "@/app/_lib/directory";
import { PublicTherapistCard } from "@/app/_components/PublicTherapistCard";

export function TherapistCard({ therapist }: { therapist: PublicTherapist }) {
  return <PublicTherapistCard therapist={therapist} />;
}
