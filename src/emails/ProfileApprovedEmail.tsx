// src/emails/ProfileApprovedEmail.tsx
import { Text, Button, Section } from '@react-email/components';
import BaseLayout from './components/BaseLayout';
import * as React from 'react';

interface ProfileApprovedEmailProps {
  profileUrl: string;
}

export default function ProfileApprovedEmail({ profileUrl = "https://masseurmatch.com/pro/dashboard" }: ProfileApprovedEmailProps) {
  return (
    <BaseLayout previewText="As tuas alterações estão online ✨">
      <Text className="text-slate-900 text-xl font-medium mb-4">
        Perfil Atualizado com Sucesso
      </Text>
      
      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        Excelente notícia! A nossa IA de qualidade e a equipa de curadoria aprovaram as tuas recentes alterações (fotos ou texto). O teu perfil já está atualizado nas pesquisas públicas.
      </Text>

      <Section className="text-center mt-6 mb-6">
        <Button 
          href={profileUrl} 
          className="bg-slate-950 text-white px-8 py-3 rounded-md text-sm font-semibold tracking-wide"
        >
          Ver Meu Perfil
        </Button>
      </Section>
    </BaseLayout>
  );
}
