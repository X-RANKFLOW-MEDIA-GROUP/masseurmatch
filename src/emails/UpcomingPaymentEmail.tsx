// src/emails/UpcomingPaymentEmail.tsx
import { Text, Button, Section, Row, Column } from '@react-email/components';
import BaseLayout from './components/BaseLayout';
import * as React from 'react';

interface UpcomingPaymentEmailProps {
  therapistName: string;
  planName: string;
  amount: string;
  renewalDate: string;
  billingUrl: string;
}

export default function UpcomingPaymentEmail({ 
  therapistName = "Alex", 
  planName = "Elite PRO", 
  amount = "$99.00",
  renewalDate = "15 de Outubro, 2026",
  billingUrl = "https://masseurmatch.com/pro/billing" 
}: UpcomingPaymentEmailProps) {
  return (
    <BaseLayout previewText={`Lembrete: A tua subscrição renova a ${renewalDate}`}>
      <Text className="text-slate-900 text-xl font-medium mb-4">
        A tua subscrição será renovada em breve.
      </Text>
      
      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        Olá {therapistName}, este é um lembrete automático de que a tua subscrição <strong>{planName}</strong> está programada para renovação automática no dia <strong>{renewalDate}</strong>.
      </Text>

      {/* Detalhes da Faturação futura */}
      <Section className="bg-slate-50 border border-slate-200 p-6 mb-6 rounded-md">
        <Row className="mb-2">
          <Column><Text className="text-slate-500 text-xs uppercase tracking-widest m-0">Valor a cobrar</Text></Column>
          <Column align="right"><Text className="text-slate-900 font-mono text-base font-semibold m-0">{amount}</Text></Column>
        </Row>
        <Row>
          <Column><Text className="text-slate-500 text-xs uppercase tracking-widest m-0">Método de Pagamento</Text></Column>
          <Column align="right"><Text className="text-slate-900 font-mono text-xs m-0">Cartão terminado em •••• 4242</Text></Column>
        </Row>
      </Section>

      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        Se precisares de atualizar o teu cartão ou alterar o teu plano, clica no botão abaixo. Se tudo estiver correto, nenhuma ação é necessária.
      </Text>

      <Section className="text-center mb-6">
        <Button 
          href={billingUrl} 
          className="bg-slate-950 text-white px-8 py-3 rounded-md text-sm font-semibold tracking-wide"
        >
          Gerir Faturação
        </Button>
      </Section>
    </BaseLayout>
  );
}
