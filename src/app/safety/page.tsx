
import React from 'react';
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
      
      {/* Content blocks would go here */}
    </main>
  );
}
