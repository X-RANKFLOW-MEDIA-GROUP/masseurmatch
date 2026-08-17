import { Body, Container, Head, Html, Img, Link, Preview, Section, Text } from '@react-email/components';
import * as React from 'react';
import { emailTheme } from '../theme';

type Props = {
  previewText: string;
  children: React.ReactNode;
  showKnotty?: boolean;
};

export default function PremiumEmailLayout({ previewText, children, showKnotty = false }: Props) {
  const { colors, fontFamily, assets, urls } = emailTheme;

  return (
    <Html>
      <Head>
        <title>{previewText}</title>
        <link rel="stylesheet" href={emailTheme.satoshiStylesheet} />
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={{ margin: 0, padding: '40px 12px 52px', backgroundColor: colors.page, fontFamily }}>
        <Container style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
          <Section style={{ textAlign: 'center', paddingBottom: '24px' }}>
            <Img src={assets.logo} width="118" alt="MasseurMatch" style={{ width: '118px', height: 'auto', margin: '0 auto' }} />
          </Section>

          <Section style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '22px', overflow: 'hidden' }}>
            <Section style={{ height: '3px', backgroundColor: colors.accent }} />
            <Section style={{ padding: '48px 52px' }}>{children}</Section>

            {showKnotty ? (
              <Section style={{ padding: '0 52px 48px' }}>
                <Section style={{ backgroundColor: colors.panel, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '28px 22px 20px', textAlign: 'center' }}>
                  <Text style={{ margin: '0 0 6px', color: colors.subtle, fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Need help?</Text>
                  <Text style={{ margin: '0 0 6px', color: colors.text, fontSize: '23px', lineHeight: '29px', fontWeight: 700 }}>Meet Knotty</Text>
                  <Text style={{ margin: '0 auto 14px', maxWidth: '390px', color: colors.muted, fontSize: '15px', lineHeight: '23px' }}>Get answers and guidance about your MasseurMatch account and platform experience.</Text>
                  <Img src={assets.knotty} width="420" alt="Knotty" style={{ width: '100%', maxWidth: '420px', height: 'auto', margin: '0 auto', borderRadius: '12px' }} />
                </Section>
              </Section>
            ) : null}
          </Section>

          <Section style={{ padding: '30px 28px 0', textAlign: 'center' }}>
            <Text style={{ margin: 0, color: colors.text, fontSize: '14px', fontWeight: 700 }}>MASSEURMATCH</Text>
            <Text style={{ margin: '6px 0 0', color: colors.subtle, fontSize: '12px', lineHeight: '20px' }}>Professional directory for independent massage providers and clients.</Text>
            <Text style={{ margin: '13px 0 0', fontSize: '12px' }}><Link href={urls.home} style={{ color: colors.accent, fontWeight: 500 }}>masseurmatch.com</Link></Text>
            <Text style={{ margin: '11px 0 0', fontSize: '12px' }}><Link href={urls.support} style={{ color: colors.subtle }}>Support</Link>{' • '}<Link href={urls.billing} style={{ color: colors.subtle }}>Billing</Link>{' • '}<Link href={urls.legal} style={{ color: colors.subtle }}>Legal</Link></Text>
            <Section style={{ width: '48px', height: '1px', backgroundColor: '#DCDDDF', margin: '24px auto' }} />
            <Text style={{ margin: 0, color: colors.subtle, fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Part of XRankFlow</Text>
            <Text style={{ margin: '7px 0 0', color: '#9B9DA1', fontSize: '11px' }}>Digital products, automation, AI and growth systems.</Text>
            <Text style={{ margin: '13px 0 0', color: '#ACADB0', fontSize: '10px' }}>© {new Date().getFullYear()} XRankFlow. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
