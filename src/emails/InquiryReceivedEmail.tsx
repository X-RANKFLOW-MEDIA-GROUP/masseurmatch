import * as React from 'react';
import { Body, Button, Container, Head, Hr, Html, Preview, Section, Text } from '@react-email/components';

interface InquiryReceivedEmailProps {
  clientName: string;
  therapistName: string;
  specialties: string[];
  inquiryDate: string;
  dashboardLink: string;
}

export default function InquiryReceivedEmail({
  clientName,
  therapistName,
  specialties,
  inquiryDate,
  dashboardLink,
}: InquiryReceivedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your inquiry to {therapistName} has been received</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Text style={heading}>Inquiry Sent Successfully</Text>
            <Hr style={hr} />
            
            <Text style={paragraph}>
              Hi {clientName},
            </Text>
            
            <Text style={paragraph}>
              Your inquiry to <strong>{therapistName}</strong> has been successfully sent! They typically respond within 24-48 hours.
            </Text>

            <Section style={detailsBox}>
              <Text style={labelText}>Therapist:</Text>
              <Text style={valueText}>{therapistName}</Text>
              
              <Text style={labelText}>Specialties:</Text>
              <Text style={valueText}>{specialties.join(', ')}</Text>
              
              <Text style={labelText}>Sent:</Text>
              <Text style={valueText}>{inquiryDate}</Text>
            </Section>

            <Text style={paragraph}>
              You can track your inquiries and manage your favorites in your dashboard.
            </Text>

            <Button style={button} href={dashboardLink}>
              View Dashboard
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
  padding: '0',
  color: '#111111',
};

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const detailsBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const labelText: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase',
  color: '#6b7280',
  marginTop: '12px',
};

const valueText = {
  fontSize: '14px',
  color: '#1f2937',
  marginTop: '4px',
};

const button = {
  backgroundColor: '#8B1E2D',
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
