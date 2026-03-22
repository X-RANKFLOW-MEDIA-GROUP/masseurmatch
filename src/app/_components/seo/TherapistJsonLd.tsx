import { buildHealthAndBeautyBusinessJsonLd } from "@/app/_lib/seo";
import { JsonLd } from "@/app/_components/JsonLd";

type TherapistJsonLdProps = {
  name: string;
  slug: string;
  description: string;
  city?: string | null;
  stateCode?: string | null;
  specialty: string;
  image?: string | null;
  phone?: string | null;
  incallPrice?: number | null;
  outcallPrice?: number | null;
  reviews?: { rating: number | null; reviewText: string; reviewerName?: string | null }[];
};

export default function TherapistJsonLd(props: TherapistJsonLdProps) {
  return <JsonLd data={buildHealthAndBeautyBusinessJsonLd(props)} />;
}
