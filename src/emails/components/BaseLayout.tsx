// src/emails/components/BaseLayout.tsx
import { Html, Head, Body, Container, Section, Text, Link, Tailwind } from '@react-email/components';
import * as React from 'react';

interface BaseLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

export default function BaseLayout({ previewText, children }: BaseLayoutProps) {
  return (
    <Html>
      <Head>
        <title>{previewText}</title>
      </Head>
      <Tailwind>
        <Body className="bg-slate-50 my-auto mx-auto font-sans px-2">
          <Container className="border border-slate-200 border-solid mt-10 mb-10 mx-auto p-0 w-[600px] bg-white shadow-sm">
            
            {/* Luxury Dark Header */}
            <Section className="bg-slate-950 py-8 px-10 text-center">
              <Text className="text-white text-2xl font-bold tracking-tighter m-0">
                Masseur<span className="text-slate-400">Match</span>
              </Text>
            </Section>

            {/* Email Content */}
            <Section className="px-10 py-8">
              {children}
            </Section>

            {/* Minimalist Footer */}
            <Section className="px-10 py-6 border-t border-slate-100 bg-slate-50">
              <Text className="text-slate-400 text-xs leading-relaxed">
                MasseurMatch Elite Directory <br />
                Dallas, TX, United States <br />
                <Link href="https://www.masseurmatch.com/privacy" className="text-slate-500 underline">Privacy Policy</Link> • <Link href="https://www.masseurmatch.com/terms" className="text-slate-500 underline">Terms of Service</Link>
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}