/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your MasseurMatch login link</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logoText}>MasseurMatch</Text>
        </Section>
        <Section style={content}>
          <Heading style={h1}>Your login link</Heading>
          <Text style={text}>
            Click below to sign in to MasseurMatch. This link will expire shortly.
          </Text>
          <Section style={btnWrap}>
            <Button style={button} href={confirmationUrl}>Sign In</Button>
          </Section>
          <Text style={muted}>
            If you didn't request this link, you can safely ignore this email.
          </Text>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>© MasseurMatch · Professional male massage directory</Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { maxWidth: '520px', margin: '0 auto' }
const header = { backgroundColor: '#000000', padding: '28px 32px', borderRadius: '12px 12px 0 0' }
const logoText = { color: '#ffffff', fontSize: '20px', fontWeight: '700' as const, letterSpacing: '-0.02em', margin: '0' }
const content = { padding: '32px 32px 24px' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#000000', margin: '0 0 16px', letterSpacing: '-0.02em' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px' }
const btnWrap = { textAlign: 'center' as const, margin: '24px 0' }
const button = { backgroundColor: '#000000', color: '#ffffff', fontSize: '15px', fontWeight: '600' as const, borderRadius: '8px', padding: '14px 32px', textDecoration: 'none' }
const muted = { fontSize: '13px', color: '#9ca3af', lineHeight: '1.5', margin: '0' }
const hr = { borderColor: '#e5e7eb', margin: '24px 32px' }
const footer = { fontSize: '12px', color: '#9ca3af', textAlign: 'center' as const, padding: '0 32px 24px', margin: '0' }
