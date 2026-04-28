import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/JsonLd";
import { CITY_BY_SLUG } from "@/lib/seo/cities";
import { buildMetadata } from "@/lib/seo/metadata";
import { MODALITY_BY_SLUG } from "@/lib/seo/modalities";
import { schema } from "@/lib/seo/schema";

export async function generateMetadata({ params }: { params: Promise<{ city: string; topic: string }> }) {
  const { city, topic } = await params;
  const cityObj = CITY_BY_SLUG.get(city);
  const modality = MODALITY_BY_SLUG.get(topic);
  if (!cityObj || !modality) return buildMetadata({ title: "Massage listings", description: "Filtered massage listings", path: `/massage/${city}/${topic}`, noIndex: true });
  const title = topic === "gay-massage" ? `Gay Massage Therapists in ${cityObj.name} | MasseurMatch` : topic === "lgbt-friendly-massage" ? `LGBT Friendly Massage Therapists in ${cityObj.name} | MasseurMatch` : topic === "male-massage" || topic === "male-massage-therapist" ? `Male Massage Therapists in ${cityObj.name} | MasseurMatch` : `${modality.label} in ${cityObj.name} | Massage Therapists on MasseurMatch`;
  const description = `Find ${modality.label.toLowerCase()} options in ${cityObj.name}. Browse independent provider profiles and contact therapists directly.`;
  return buildMetadata({ title, description, path: `/massage/${city}/${topic}` });
}

export default async function TopicPage({ params }: { params: Promise<{ city: string; topic: string }> }) {
  const { city, topic } = await params;
  const cityObj = CITY_BY_SLUG.get(city);
  const modality = MODALITY_BY_SLUG.get(topic);
  if (!cityObj || !modality) notFound();
  const faq = [
    { question: `What should I check before contacting a ${modality.label.toLowerCase()} provider?`, answer: "Review profile services, session format, location context, and preferred contact method first." },
    { question: "Does MasseurMatch verify licenses?", answer: "No universal verification claim is made. Profiles are managed by independent providers." },
  ];
  return <main className="container mx-auto px-4 py-10"><JsonLd data={schema.faq(faq)} /><h1 className="text-3xl font-bold">{modality.label} in {cityObj.name}</h1><p className="mt-3 text-muted-foreground">Explore filtered profiles and contact therapists directly.</p><div className="mt-6 flex flex-wrap gap-4"><Link href={`/massage/${cityObj.slug}`} className="text-primary hover:underline">Back to {cityObj.name} city page</Link><Link href="/therapists" className="text-primary hover:underline">View therapist profiles</Link></div><h2 className="mt-8 text-xl font-semibold">Related massage styles</h2><ul className="mt-3 grid gap-2 md:grid-cols-2">{Array.from(MODALITY_BY_SLUG.values()).filter((item) => item.slug !== topic).slice(0, 6).map((item) => <li key={item.slug}><Link href={`/massage/${cityObj.slug}/${item.slug}`} className="text-primary hover:underline">{item.label} in {cityObj.name}</Link></li>)}</ul><h2 className="mt-8 text-xl font-semibold">FAQ</h2>{faq.map((item) => <div key={item.question} className="mt-3"><h3 className="font-medium">{item.question}</h3><p className="text-muted-foreground">{item.answer}</p></div>)}</main>;
}
