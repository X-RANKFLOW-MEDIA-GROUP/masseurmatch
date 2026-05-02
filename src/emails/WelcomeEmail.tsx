// src/emails/WelcomeEmail.tsx
import * as React from 'react';
import { Body, Button, Container, Head, Hr, Html, Preview, Section, Text } from '@react-email/components';

interface WelcomeEmailProps {
  name: string;
  isTherapist: boolean;
  onboardingLink: string;
}

export default function WelcomeEmail({
  name,
  isTherapist,
  onboardingLink,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to MasseurMatch</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Text style={heading}>Welcome to MasseurMatch</Text>
            <Hr style={hr} />

            <Text style={paragraph}>
              Hi {name},
            </Text>

            {isTherapist ? (
              <>
                <Text style={paragraph}>
                  Welcome to MasseurMatch! We're excited to have you join our community of professional therapists.
                </Text>

                <Section style={featureBox}>
                  <Text style={featureTitle}>Get Started:</Text>
                  <Text style={bulletPoint}>✓ Complete your profile with photos and specialties</Text>
                  <Text style={bulletPoint}>✓ Set your availability and pricing</Text>
                  <Text style={bulletPoint}>✓ Start receiving client inquiries</Text>
                  <Text style={bulletPoint}>✓ Manage your bookings and reviews</Text>
                </Section>

                <Text style={paragraph}>
                  Your profile visibility increases as you complete more information. Let's get your onboarding started!
                </Text>
              </>
            ) : (
              <>
                <Text style={paragraph}>
                  Welcome! You now have access to our directory of verified massage therapists and wellness professionals.
                </Text>

                <Section style={featureBox}>
                  <Text style={featureTitle}>Explore:</Text>
                  <Text style={bulletPoint}>✓ Browse therapists by specialty and location</Text>
                  <Text style={bulletPoint}>✓ Save your favorite providers</Text>
                  <Text style={bulletPoint}>✓ Send inquiries directly to therapists</Text>
                  <Text style={bulletPoint}>✓ Leave reviews and ratings</Text>
                </Section>

                <Text style={paragraph}>
                  Start by exploring our therapist directory and finding the perfect match for your wellness needs.
                </Text>
              </>
            )}

            <Button style={button} href={onboardingLink}>
              {isTherapist ? 'Complete Your Profile' : 'Explore Therapists'}
            </Button>

            <Hr style={hr} />
            <Text style={footer}>
              © 2026 MasseurMatch. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f3f4f6',
  fontFamily: '"Segoe UI", "Helvetica Neue", sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const box = {
  padding: '0 48px',
};

const heading = {
  fontSize: '28px',
  fontWeight: '700',
  margin: '16px 0',
  color: '#0B1F3A',
};

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const featureBox = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const featureTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#0c4a6e',
  marginBottom: '12px',
};

const bulletPoint = {
  fontSize: '14px',
  color: '#1e40af',
  lineHeight: '24px',
  margin: '6px 0',
};

const button = {
  backgroundColor: '#FF8A1F',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '600',
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  margin: '24px 0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

const footer = {
  color: '#9ca3af',
  fontSize: '12px',
  textAlign: 'center' as const,
};
