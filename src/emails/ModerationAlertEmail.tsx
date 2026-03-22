// src/emails/ModerationAlertEmail.tsx
import { Text, Button, Section } from '@react-email/components';
import BaseLayout from './components/BaseLayout';
import * as React from 'react';

interface ModerationAlertEmailProps {
  reason: string;
  editUrl: string;
}

export default function ModerationAlertEmail({ 
  reason = "Linguagem sugestiva ou não profissional detectada.",
  editUrl = "https://masseurmatch.com/pro/listing"
}: ModerationAlertEmailProps) {
  return (
    <BaseLayout previewText="Ação Necessária: Atualização de perfil retida">
      <Text className="text-rose-600 text-xl font-medium mb-4">
        Revisão de Perfil Necessária
      </Text>
      
      <Text className="text-slate-600 text-sm leading-relaxed mb-4">
        Para mantermos a excelência e segurança da rede MasseurMatch, todas as atualizações passam por uma revisão. A tua última tentativa de atualização não pôde ser publicada pelo seguinte motivo:
      </Text>

      <Section className="bg-rose-50 border border-rose-100 p-4 mb-6 rounded-md">
        <Text className="text-rose-800 text-sm font-medium m-0">
          Motivo: {reason}
        </Text>
      </Section>

      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        O teu perfil antigo continua online. Por favor, acede ao teu painel e ajusta as informações de acordo com as nossas diretrizes de qualidade para que possamos aprová-las.
      </Text>

      <Section className="text-center mb-6">
        <Button 
          href={editUrl} 
          className="bg-slate-950 text-white px-8 py-3 rounded-md text-sm font-semibold tracking-wide"
        >
          Editar Informações
        </Button>
      </Section>
    </BaseLayout>
  );
}
