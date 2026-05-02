// src/emails/SubscriptionCancelledEmail.tsx
import { Text, Button, Section } from '@react-email/components';
import BaseLayout from './components/BaseLayout';
import * as React from 'react';

interface SubscriptionCancelledEmailProps {
  therapistName: string;
  planName: string;
  endDate: string;
  reactivateUrl: string;
}

export default function SubscriptionCancelledEmail({ 
  therapistName = "Alex", 
  planName = "Elite PRO", 
  endDate = "15 de Novembro, 2026",
  reactivateUrl = "https://masseurmatch.com/pro/billing" 
}: SubscriptionCancelledEmailProps) {
  return (
    <BaseLayout previewText="A tua subscrição foi cancelada">
      <Text className="text-slate-900 text-xl font-medium mb-4">
        Confirmação de Cancelamento
      </Text>
      
      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        Olá {therapistName}, recebemos o teu pedido e a tua subscrição <strong>{planName}</strong> foi cancelada. Não faremos mais nenhuma cobrança no teu cartão.
      </Text>

      <Section className="bg-slate-50 border border-slate-200 p-4 mb-6 rounded-md">
        <Text className="text-slate-700 text-sm m-0 leading-relaxed">
          Continuarás a ter acesso total a todas as tuas funcionalidades PRO até ao final do ciclo de faturação atual: <strong className="font-mono text-slate-900">{endDate}</strong>. Após esta data, o teu perfil será ajustado para o plano básico gratuito.
        </Text>
      </Section>

      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        Foi um prazer ajudar-te a crescer. Se mudares de ideias ou a tua disponibilidade alterar, podes reativar a tua conta a qualquer momento com apenas um clique.
      </Text>

      <Section className="text-center mb-6">
        <Button 
          href={reactivateUrl} 
          className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-8 py-3 rounded-md text-sm font-semibold tracking-wide"
        >
          Reativar a minha subscrição
        </Button>
      </Section>
    </BaseLayout>
  );
}
