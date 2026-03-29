// src/emails/PaymentFailedEmail.tsx
import { Text, Button, Section } from '@react-email/components';
import BaseLayout from './components/BaseLayout';
import * as React from 'react';

interface PaymentFailedEmailProps {
  billingUrl: string;
}

export default function PaymentFailedEmail({ billingUrl = "https://masseurmatch.com/pro/billing" }: PaymentFailedEmailProps) {
  return (
    <BaseLayout previewText="Ação Necessária: Atualiza o teu método de pagamento">
      <Text className="text-amber-600 text-xl font-medium mb-4">
        Problema com o Pagamento
      </Text>
      
      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        Não conseguimos processar a renovação da tua subscrição MasseurMatch Elite com o cartão que temos registado. Para não perderes acesso ao botão "Available Now" e ao teu posicionamento premium nas pesquisas, por favor atualiza os teus dados.
      </Text>

      <Section className="text-center mt-6 mb-6">
        <Button 
          href={billingUrl} 
          className="bg-amber-500 text-white px-8 py-4 rounded-md text-sm font-semibold tracking-wide"
        >
          Atualizar Pagamento Seguro
        </Button>
      </Section>
      
      <Text className="text-slate-500 text-xs mt-6">
        Tentaremos processar o pagamento novamente nas próximas 48 horas.
      </Text>
    </BaseLayout>
  );
}
