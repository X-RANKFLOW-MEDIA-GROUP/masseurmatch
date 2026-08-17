import { Section, Text } from '@react-email/components';
import PremiumEmailLayout from './components/PremiumEmailLayout';
import { emailTheme } from './theme';

export type SubscriptionCancelledPremiumEmailProps = {
  therapistName?: string;
  planName?: string;
  endDate?: string;
};

export default function SubscriptionCancelledPremiumEmail({ therapistName = 'Alex', planName = 'Premium', endDate }: SubscriptionCancelledPremiumEmailProps) {
  const { colors } = emailTheme;
  return (
    <PremiumEmailLayout previewText="Your MasseurMatch subscription has been cancelled" showKnotty>
      <Text style={{ margin: '0 0 18px', color: colors.subtle, fontSize: '11px', fontWeight: 700, letterSpacing: '1.8px', textTransform: 'uppercase' }}>Account update</Text>
      <Text style={{ margin: '0 0 18px', color: colors.text, fontSize: '36px', lineHeight: '41px', fontWeight: 700, letterSpacing: '-1.1px' }}>Your subscription has been cancelled.</Text>
      <Text style={{ margin: '0 0 24px', color: colors.muted, fontSize: '17px', lineHeight: '27px' }}>Hi {therapistName}, your {planName} subscription has been cancelled successfully. You will not be charged again unless you activate a new paid plan in the future.</Text>
      <Section style={{ backgroundColor: colors.panel, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '22px', marginBottom: '24px' }}>
        <Text style={{ margin: '0 0 8px', color: colors.subtle, fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Subscription status</Text>
        <Text style={{ margin: 0, color: colors.text, fontSize: '16px', lineHeight: '24px', fontWeight: 500 }}>{planName} membership: <span style={{ color: colors.accent, fontWeight: 700 }}>Cancelled</span></Text>
        {endDate ? <Text style={{ margin: '8px 0 0', color: colors.muted, fontSize: '14px', lineHeight: '22px' }}>Current paid access remains available through {endDate}.</Text> : null}
      </Section>
      <Text style={{ margin: 0, color: colors.muted, fontSize: '15px', lineHeight: '25px' }}>Your MasseurMatch profile and account remain subject to your current account status. MasseurMatch is a professional directory that helps clients discover independent massage providers and contact them directly outside the platform.</Text>
    </PremiumEmailLayout>
  );
}
