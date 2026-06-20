import * as React from 'react';
import { Body, Button, Container, Head, Hr, Html, Preview, Section, Text } from '@react-email/components';

interface ReviewNotificationEmailProps {
  therapistName: string;
  clientName: string;
  rating: number;
  reviewText: string;
  dashboardLink: string;
}

export default function ReviewNotificationEmail({
  therapistName,
  clientName,
  rating,
  reviewText,
  dashboardLink,
}: ReviewNotificationEmailProps) {
  const stars = '⭐'.repeat(rating);

  return (
    <Html>
      <Head />
      <Preview>New review from {clientName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Text style={heading}>New Review Received</Text>
            <Hr style={hr} />

            <Text style={paragraph}>
              Hi {therapistName},
            </Text>

            <Text style={paragraph}>
              You've received a new review from <strong>{clientName}</strong>!
            </Text>

            <Section style={reviewBox}>
              <Text style={ratingText}>{stars} ({rating}/5 stars)</Text>
              <Text style={reviewContent}>"{reviewText}"</Text>
              <Text style={reviewerText}>— {clientName}</Text>
            </Section>

            <Text style={paragraph}>
              View your reviews and respond to clients in your therapist dashboard.
            </Text>

            <Button style={button} href={dashboardLink}>
              View Reviews
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
  fontSize: '24px',
  fontWeight: '600',
  margin: '16px 0',
  color: '#1A1A1A',
};

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const reviewBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fcd34d',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const ratingText = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#92400e',
  margin: '0 0 8px 0',
};

const reviewContent = {
  fontSize: '14px',
  color: '#78350f',
  fontStyle: 'italic',
  margin: '8px 0',
};

const reviewerText = {
  fontSize: '12px',
  color: '#92400e',
  margin: '8px 0 0 0',
};

const button = {
  backgroundColor: '#C8102E',
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
