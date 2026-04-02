import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicTherapistBySlug } from "@/app/_lib/directory";

export const metadata: Metadata = {
  title: "KevinOS - Terapeuta em Carrollton, TX | MasseurMatch",
  description: "Perfil de KevinOS, terapeuta certificado em Carrollton, TX. Massagem terapêutica e sensual. Veja fotos, avaliações e agende sua sessão.",
};

export default async function Page() {
  const therapist = await getPublicTherapistBySlug("kevin-os");

  if (!therapist) {
    notFound();
  }

  const name = therapist.display_name || therapist.full_name || "KevinOS";
  const city = therapist.city || "Carrollton";
  const profileSlug = therapist.slug || therapist.id;

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
      <p className="mt-2 text-muted-foreground">Perfil público em {city}.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/therapists/${profileSlug}`}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Abrir perfil completo
        </Link>
        <Link
          href="/therapists"
          className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
        >
          Ver diretório
        </Link>
      </div>
    </main>
  );
}
