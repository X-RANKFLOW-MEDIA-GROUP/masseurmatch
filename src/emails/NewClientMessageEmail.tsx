// src/emails/NewClientMessageEmail.tsx
import { Text, Button, Section } from '@react-email/components';
import BaseLayout from './components/BaseLayout';
import * as React from 'react';

interface NewClientMessageEmailProps {
  therapistName: string;
  clientCity: string;
  inboxUrl: string;
}

export default function NewClientMessageEmail({ 
  therapistName = "Alex", 
  clientCity = "Dallas",
  inboxUrl = "https://masseurmatch.com/pro/messages" 
}: NewClientMessageEmailProps) {
  return (
    <BaseLayout previewText={`Novo pedido de massagem em ${clientCity}`}>
      <Text className="text-slate-900 text-xl font-medium mb-4">
        Nova solicitação de cliente 🔔
      </Text>
      
      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        Olá {therapistName}, um cliente na área de <strong>{clientCity}</strong> acabou de enviar-te uma mensagem através do teu perfil no MasseurMatch.
      </Text>

      {/* Caixa de destaque brutalista */}
      <Section className="bg-slate-50 border-l-4 border-indigo-500 p-4 mb-8">
        <Text className="text-slate-700 text-sm font-medium m-0">
          Dica de Elite: Terapeutas que respondem nos primeiros 15 minutos têm 80% mais probabilidade de fechar a sessão.
        </Text>
      </Section>

      <Section className="text-center mb-6">
        <Button 
          href={inboxUrl} 
          className="bg-indigo-600 text-white px-8 py-4 rounded-md text-sm font-semibold tracking-wide"
        >
          Ler e Responder Agora
        </Button>
      </Section>
    </BaseLayout>
  );
}
