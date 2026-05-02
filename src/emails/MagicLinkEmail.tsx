// src/emails/MagicLinkEmail.tsx
import { Text, Button, Section } from '@react-email/components';
import BaseLayout from './components/BaseLayout';
import * as React from 'react';

interface MagicLinkEmailProps {
  loginUrl: string;
}

export default function MagicLinkEmail({ loginUrl = "https://masseurmatch.com/auth/callback" }: MagicLinkEmailProps) {
  return (
    <BaseLayout previewText="Seu link de acesso seguro ao MasseurMatch">
      <Text className="text-slate-900 text-xl font-medium mb-4">
        Acesso Seguro
      </Text>
      
      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        Clica no botão abaixo para entrares de forma segura na tua conta MasseurMatch. Este link expira em 15 minutos.
      </Text>

      <Section className="text-center mt-6 mb-6">
        <Button 
          href={loginUrl} 
          className="bg-slate-950 text-white px-8 py-4 rounded-md text-sm font-semibold tracking-wide"
        >
          Entrar na Conta
        </Button>
      </Section>

      <Text className="text-slate-500 text-xs mt-6">
        Se não solicitaste este link, podes ignorar este e-mail em segurança.
      </Text>
    </BaseLayout>
  );
}
