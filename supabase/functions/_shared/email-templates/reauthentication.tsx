/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your MasseurMatch verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logoText}>MasseurMatch</Text>
        </Section>
        <Section style={content}>
          <Heading style={h1}>Verification code</Heading>
          <Text style={text}>Use the code below to confirm your identity:</Text>
          <Section style={codeBox}>
            <Text style={codeStyle}>{token}</Text>
          </Section>
          <Text style={muted}>
            This code expires shortly. If you didn't request this, ignore this email.
          </Text>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>© MasseurMatch · Professional male massage directory</Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { maxWidth: '520px', margin: '0 auto' }
const header = { backgroundColor: '#000000', padding: '28px 32px', borderRadius: '12px 12px 0 0' }
const logoText = { color: '#ffffff', fontSize: '20px', fontWeight: '700' as const, letterSpacing: '-0.02em', margin: '0' }
const content = { padding: '32px 32px 24px' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#000000', margin: '0 0 16px', letterSpacing: '-0.02em' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px' }
const codeBox = { backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '16px', textAlign: 'center' as const, margin: '24px 0' }
const codeStyle = { fontFamily: "'SF Mono', 'Courier New', monospace", fontSize: '32px', fontWeight: '700' as const, color: '#000000', letterSpacing: '0.15em', margin: '0' }
const muted = { fontSize: '13px', color: '#9ca3af', lineHeight: '1.5', margin: '0' }
const hr = { borderColor: '#e5e7eb', margin: '24px 32px' }
const footer = { fontSize: '12px', color: '#9ca3af', textAlign: 'center' as const, padding: '0 32px 24px', margin: '0' }
