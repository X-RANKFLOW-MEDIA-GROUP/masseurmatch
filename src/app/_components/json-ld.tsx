import { JsonLd as BaseJsonLd } from "@/app/_components/JsonLd";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <BaseJsonLd data={data} />;
}
