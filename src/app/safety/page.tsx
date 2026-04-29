
import React from 'react';
import Link from "next/link";
import { FAQJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export const metadata = {
  title: 'Safety & Trust | MasseurMatch',
  description: 'Learn how MasseurMatch verifies therapists and ensures a safe, premium experience for direct contact massage.',
};

export default function SafetyPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <BreadcrumbJsonLd items={[{ name: 'Home', url: 'https://masseurmatch.com' }, { name: 'Safety', url: 'https://masseurmatch.com/safety' }]} />
      <FAQJsonLd faqs={[
        { question: 'How are therapists verified?', answer: 'We require government ID and live photo verification.' },
        { question: 'Is direct contact safe?', answer: 'Yes, you control the communication and booking directly with verified professionals.' }
      ]} />
      
      <h1 className="text-4xl font-bold mb-6">The Safest Way to Find a Verified Male Massage Therapist</h1>
      <p className="text-lg text-muted-foreground mb-8">We prioritize your safety and trust before anything else. Here is how we verify our network.</p>
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-semibold text-red-800">Need to report suspected trafficking?</p>
        <p className="mt-2 text-sm text-red-700">
          Use the report button on any profile or read our dedicated policy page with reporting channels.
        </p>
        <Link href="/safety/anti-trafficking" className="mt-3 inline-block text-sm font-semibold text-red-800 underline">
          Open Anti-Trafficking Policy
        </Link>
      </div>
      
      {/* Content blocks would go here */}
    </main>
  );
}
