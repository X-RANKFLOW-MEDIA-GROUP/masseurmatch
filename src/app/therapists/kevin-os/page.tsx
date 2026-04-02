import kevinOS from "../../../../mm/data/therapists/kevin-os";
import TherapistCard from "../../../../mm/components/therapist-card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "KevinOS - Terapeuta em Carrollton, TX | MasseurMatch",
  description: "Perfil de KevinOS, terapeuta certificado em Carrollton, TX. Massagem terapêutica e sensual. Veja fotos, avaliações e agende sua sessão.",
  openGraph: {
    title: "KevinOS - Terapeuta em Carrollton, TX | MasseurMatch",
    images: kevinOS.photos,
    description: "Perfil de KevinOS, terapeuta certificado em Carrollton, TX. Massagem terapêutica e sensual. Veja fotos, avaliações e agende sua sessão."
  }
};

export default function Page() {
  return (
    <main>
      <TherapistCard therapist={kevinOS} featured />
    </main>
  );
}
