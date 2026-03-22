// src/emails/ResetPasswordEmail.tsx
import { Text, Button, Section } from '@react-email/components';
import BaseLayout from './components/BaseLayout';
import * as React from 'react';

interface ResetPasswordEmailProps {
  resetUrl: string;
}

export default function ResetPasswordEmail({ resetUrl = "https://masseurmatch.com/reset" }: ResetPasswordEmailProps) {
  return (
    <BaseLayout previewText="Instruções para redefinir a tua password">
      <Text className="text-slate-900 text-xl font-medium mb-4">
        Redefinir Password
      </Text>
      
      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        Recebemos um pedido para alterar a password da tua conta. Para criares uma nova password, clica no botão abaixo.
      </Text>

      <Section className="text-center mt-6 mb-6">
        <Button 
          href={resetUrl} 
          className="bg-slate-950 text-white px-8 py-4 rounded-md text-sm font-semibold tracking-wide"
        >
          Criar Nova Password
        </Button>
      </Section>

      <Text className="text-slate-500 text-xs mt-6">
        Se não fizeste este pedido, a tua conta está segura e nenhuma alteração foi feita.
      </Text>
    </BaseLayout>
  );
}
